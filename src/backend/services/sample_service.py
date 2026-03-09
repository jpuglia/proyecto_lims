from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.backend.repositories.fact import (SolicitudMuestreoRepository, HistoricoSolicitudMuestreoRepository,
                                           MuestreoRepository, MuestraRepository, EnvioMuestraRepository, RecepcionRepository)
from src.backend.models.fact import SolicitudMuestreo, SolicitudMuestreoEquipo, Muestreo, Muestra, EnvioMuestra, Recepcion

class SampleService:
    def __init__(self,
                 solicitud_repo: SolicitudMuestreoRepository,
                 historico_solicitud_repo: HistoricoSolicitudMuestreoRepository,
                 muestreo_repo: MuestreoRepository,
                 muestra_repo: MuestraRepository,
                 envio_repo: EnvioMuestraRepository,
                 recepcion_repo: RecepcionRepository,
                 analysis_service = None):
        self.solicitud_repo = solicitud_repo
        self.historico_solicitud_repo = historico_solicitud_repo
        self.muestreo_repo = muestreo_repo
        self.muestra_repo = muestra_repo
        self.envio_repo = envio_repo
        self.recepcion_repo = recepcion_repo
        self.analysis_service = analysis_service

    def create_sampling_request(self, db: Session, solicitud_data: dict, usuario_id: int) -> SolicitudMuestreo:
        equipos_ids = solicitud_data.pop("equipos_ids", [])
        solicitud = self.solicitud_repo.create(db, solicitud_data)
        
        # Link multiple equipment
        if equipos_ids:
            for eq_id in equipos_ids:
                db.add(SolicitudMuestreoEquipo(solicitud_muestreo_id=solicitud.solicitud_muestreo_id, equipo_instrumento_id=eq_id))
        
        # Insert initial history
        self.historico_solicitud_repo.create(db, {
            "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
            "estado_solicitud_id": solicitud_data["estado_solicitud_id"],
            "fecha": datetime.now(timezone.utc),
            "usuario_id": usuario_id,
            "observacion": "Creación de solicitud"
        })
        
        db.commit()
        return solicitud

    def register_sampling_session(self, db: Session, session_data: dict, muestras_data: list, envios_data: list = None) -> Muestreo:
        try:
            # Create session
            muestreo = self.muestreo_repo.create(db, session_data)
            db.flush()
            
            # Create individual samples in session
            created_samples = []
            for muestra_val in muestras_data:
                muestra_val["muestreo_id"] = muestreo.muestreo_id
                s = self.muestra_repo.create(db, muestra_val)
                db.flush()
                created_samples.append(s)
                
            # Handle fractioned shipments if provided
            if envios_data:
                for envio_val in envios_data:
                    # Link to each sample in the session for this demo
                    for s in created_samples:
                        envio_copy = envio_val.copy()
                        envio_copy["muestra_id"] = s.muestra_id
                        self.envio_repo.create(db, envio_copy)
                db.flush()

            # Update Solicitud Status to 'Completado' (3)
            solicitud = self.solicitud_repo.get(db, session_data["solicitud_muestreo_id"])
            if solicitud:
                self.solicitud_repo.update(db, solicitud, {"estado_solicitud_id": 3})
                self.historico_solicitud_repo.create(db, {
                    "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
                    "estado_solicitud_id": 3,
                    "fecha": datetime.now(timezone.utc),
                    "usuario_id": session_data.get("operario_id", 1),
                    "observacion": f"Muestreo ejecutado (Sesión #{muestreo.muestreo_id})"
                })
            
            db.commit()
            return muestreo
        except Exception as e:
            db.rollback()
            from src.backend.core.logging import get_logger
            logger = get_logger(__name__)
            logger.error(f"Error in register_sampling_session: {str(e)}", exc_info=True)
            raise e

    def receive_sample(self, db: Session, recepcion_data: dict) -> Recepcion:
        # Business logic for receiving sample at lab
        recepcion = self.recepcion_repo.create(db, recepcion_data)

        # TRIGGER: If accepted (total or partial), auto-create Analysis
        if recepcion.decision in ["Aceptado", "Aceptado Parcial"] and self.analysis_service:
            # Find the sample from the shipment
            envio = self.envio_repo.get(db, recepcion.envio_muestra_id)
            if envio:
                # Create Analysis in 'Programado' (1) state
                self.analysis_service.create_analisis(db, {
                    "muestra_id": envio.muestra_id,
                    "recepcion_id": recepcion.recepcion_id,
                    "metodo_version_id": 1, # Placeholder, should be resolved based on product
                    "estado_analisis_id": 1, # 'Programado'
                    "operario_id": recepcion.operario_id,
                    "fecha_inicio": datetime.now(timezone.utc)
                }, operario_id=recepcion.operario_id)

        return recepcion
