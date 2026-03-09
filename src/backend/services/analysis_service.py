from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from src.backend.repositories.fact import (AnalisisRepository, EstadoAnalisisRepository, 
                                           HistorialEstadoAnalisisRepository, IncubacionRepository, 
                                           ResultadoRepository, SolicitudMuestreoRepository,
                                           MuestreoRepository, MuestraRepository, EnvioMuestraRepository,
                                           RecepcionRepository)
from src.backend.repositories.inventory import UsoMediosRepository, UsoCepaRepository
from src.backend.repositories.master import EspecificacionRepository
from src.backend.models.fact import Analisis, Incubacion, Resultado, UsoEquipoAnalisis

class AnalysisService:
    def __init__(self,
                 analisis_repo: AnalisisRepository,
                 estado_analisis_repo: EstadoAnalisisRepository,
                 historial_repo: HistorialEstadoAnalisisRepository,
                 incubacion_repo: IncubacionRepository,
                 resultado_repo: ResultadoRepository,
                 especificacion_repo: EspecificacionRepository,
                 uso_medios_repo: UsoMediosRepository,
                 uso_cepa_repo: UsoCepaRepository):
        self.analisis_repo = analisis_repo
        self.estado_analisis_repo = estado_analisis_repo
        self.historial_repo = historial_repo
        self.incubacion_repo = incubator_repo = incubacion_repo
        self.resultado_repo = resultado_repo
        self.especificacion_repo = especificacion_repo
        self.uso_medios_repo = uso_medios_repo
        self.uso_cepa_repo = uso_cepa_repo

    def change_analysis_state(self, db: Session, analisis_id: int, nuevo_estado_id: int, operario_id: int) -> Analisis:
        analisis = self.analisis_repo.get(db, analisis_id)
        if not analisis:
            raise ValueError(f"Analysis with ID {analisis_id} not found")

        update_data = {"estado_analisis_id": nuevo_estado_id, "ultimo_cambio": datetime.now(timezone.utc)}
        
        # 'En ejecución' (2) trigger
        if nuevo_estado_id == 2 and not analisis.fecha_inicio:
            update_data["fecha_inicio"] = datetime.now(timezone.utc)

        analisis = self.analisis_repo.update(db, analisis, update_data)

        # Register history
        self.historial_repo.create(db, {
            "analisis_id": analisis_id,
            "estado_analisis_id": nuevo_estado_id,
            "fecha": datetime.now(timezone.utc),
            "operario_id": operario_id
        })

        return analisis

    def create_analisis(self, db: Session, analisis_data: dict, operario_id: int) -> Analisis:
        analisis = self.analisis_repo.create(db, analisis_data)
        
        self.historial_repo.create(db, {
            "analisis_id": analisis.analisis_id,
            "estado_analisis_id": analisis_data["estado_analisis_id"],
            "fecha": datetime.now(timezone.utc),
            "operario_id": operario_id
        })
        return analisis

    def create_bulk_analisis(self, db: Session, bulk_data: dict) -> List[Analisis]:
        results = []
        for metodo_id in bulk_data["metodos_versions_ids"]:
            analisis_data = {
                "muestra_id": bulk_data["muestra_id"],
                "recepcion_id": bulk_data["recepcion_id"],
                "metodo_version_id": metodo_id,
                "estado_analisis_id": bulk_data.get("estado_analisis_id", 1),
                "operario_id": bulk_data["operario_id"]
            }
            res = self.create_analisis(db, analisis_data, bulk_data["operario_id"])
            results.append(res)
        return results

    def start_incubation(self, db: Session, incubacion_data: dict) -> Incubacion:
        # Link analysis to incubation
        return self.incubacion_repo.create(db, incubacion_data)

    def finish_incubation(self, db: Session, incubacion_id: int, update_data: dict) -> Incubacion:
        inc = self.incubacion_repo.get(db, incubacion_id)
        if not inc:
            raise ValueError("Incubación no encontrada.")
        return self.incubacion_repo.update(db, inc, update_data)

    def register_usage_equipment(self, db: Session, usage_data: dict) -> UsoEquipoAnalisis:
        from src.backend.repositories.dim import EquipoInstrumentoRepository
        eq_repo = EquipoInstrumentoRepository()
        eq = eq_repo.get(db, usage_data["equipo_instrumento_id"])
        if not eq:
            raise ValueError("El equipo no existe.")
        
        # In a real scenario, check if active/calibrated
        
        usage = UsoEquipoAnalisis(**usage_data)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return usage

    def register_resultado(self, db: Session, resultado_data: dict, is_final: bool = False) -> Resultado:
        # Evaluate specification if provided numerically
        analisis = self.analisis_repo.get(db, resultado_data["analisis_id"])
        
        conforme = None
        if analisis and analisis.especificacion_id and "valor_numerico" in resultado_data:
            especificacion = self.especificacion_repo.get(db, analisis.especificacion_id)
            if especificacion:
                val = resultado_data["valor_numerico"]
                if especificacion.valor_min is not None and val < especificacion.valor_min:
                    conforme = False
                elif especificacion.valor_max is not None and val > especificacion.valor_max:
                    conforme = False
                else:
                    conforme = True
                    
        resultado_data["conforme"] = conforme
        
        # Check if already has a result (for overwriting in final)
        existing_res = db.query(Resultado).filter_by(analisis_id=resultado_data["analisis_id"]).first()
        if existing_res:
            res = self.resultado_repo.update(db, existing_res, resultado_data)
        else:
            res = self.resultado_repo.create(db, resultado_data)
        
        # Update Analysis Status
        new_state = 4 if is_final else 3 # 3: Preliminar, 4: Final
        self.change_analysis_state(db, res.analisis_id, new_state, res.operario_id)
        
        return res

    def register_usage_media(self, db: Session, usage_data: dict):
        # Validate media is approved (ID 2)
        stock_media = self.uso_medios_repo.get_all(db) # This is not correct way to get media from usage_data
        from src.backend.repositories.inventory import StockMediosRepository
        stock_repo = StockMediosRepository()
        media = stock_repo.get(db, usage_data["stock_medios_id"])
        
        if not media or media.estado_qc_id != 2:
            raise ValueError("El lote de medio no está aprobado para su uso.")
            
        return self.uso_medios_repo.create(db, usage_data)

    def register_usage_strain(self, db: Session, usage_data: dict):
        # Validate strain exists
        from src.backend.repositories.master import CepaReferenciaRepository
        cepa_repo = CepaReferenciaRepository()
        cepa = cepa_repo.get(db, usage_data["cepa_referencia_id"])
        
        if not cepa:
            raise ValueError("La cepa de referencia no existe.")
            
        return self.uso_cepa_repo.create(db, usage_data)

    def get_analysis_report(self, db: Session, solicitud_id: int):
        sol_repo = SolicitudMuestreoRepository()
        muestreo_repo = MuestreoRepository()
        muestra_repo = MuestraRepository()
        envio_repo = EnvioMuestraRepository()
        recepcion_repo = RecepcionRepository()
        
        solicitud = sol_repo.get(db, solicitud_id)
        if not solicitud:
            return None
            
        muestreo = db.query(muestreo_repo.model).filter_by(solicitud_muestreo_id=solicitud_id).first()
        muestras = []
        envios = []
        recepciones = []
        analisis_list = []
        incubaciones = []
        resultados = []
        
        if muestreo:
            muestras = db.query(muestra_repo.model).filter_by(muestreo_id=muestreo.muestreo_id).all()
            for m in muestras:
                m_envios = db.query(envio_repo.model).filter_by(muestra_id=m.muestra_id).all()
                envios.extend(m_envios)
                for e in m_envios:
                    m_recepciones = db.query(recepcion_repo.model).filter_by(envio_muestra_id=e.envio_muestra_id).all()
                    recepciones.extend(m_recepciones)
                    
                m_analisis = db.query(self.analisis_repo.model).filter_by(muestra_id=m.muestra_id).all()
                analisis_list.extend(m_analisis)
                for a in m_analisis:
                    m_incubaciones = db.query(self.incubacion_repo.model).filter_by(analisis_id=a.analisis_id).all()
                    incubaciones.extend(m_incubaciones)
                    m_resultados = db.query(self.resultado_repo.model).filter_by(analisis_id=a.analisis_id).all()
                    resultados.extend(m_resultados)
                    
        return {
            "solicitud": solicitud,
            "muestreo": muestreo,
            "muestras": muestras,
            "envios": envios,
            "recepciones": recepciones,
            "analisis": analisis_list,
            "incubaciones": incubaciones,
            "resultados": resultados
        }
