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
from src.backend.models.fact import Analisis, Incubacion, Resultado

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
        self.incubacion_repo = incubacion_repo
        self.resultado_repo = resultado_repo
        self.especificacion_repo = especificacion_repo
        self.uso_medios_repo = uso_medios_repo
        self.uso_cepa_repo = uso_cepa_repo

    def change_analysis_state(self, db: Session, analisis_id: int, nuevo_estado_id: int, operario_id: int) -> Analisis:
        analisis = self.analisis_repo.get(db, analisis_id)
        if not analisis:
            raise ValueError(f"Analysis with ID {analisis_id} not found")

        update_data = {"estado_analisis_id": nuevo_estado_id, "ultimo_cambio": datetime.now(timezone.utc)}
        
        # 'En proceso' (2) trigger
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

    def start_incubation(self, db: Session, incubacion_data: dict) -> Incubacion:
        return self.incubacion_repo.create(db, incubacion_data)

    def register_resultado(self, db: Session, resultado_data: dict) -> Resultado:
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
        
        return self.resultado_repo.create(db, resultado_data)

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
