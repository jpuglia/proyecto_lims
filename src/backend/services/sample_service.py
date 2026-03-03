from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.backend.repositories.fact import (SolicitudMuestreoRepository, HistoricoSolicitudMuestreoRepository,
                                           MuestreoRepository, MuestraRepository, EnvioMuestraRepository, RecepcionRepository)
from src.backend.models.fact import SolicitudMuestreo, Muestreo, Muestra, Recepcion

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
        solicitud = self.solicitud_repo.create(db, solicitud_data)
        
        # Insert initial history
        self.historico_solicitud_repo.create(db, {
            "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
            "estado_solicitud_id": solicitud_data["estado_solicitud_id"],
            "fecha": datetime.now(timezone.utc),
            "usuario_id": usuario_id,
            "observacion": "Creación de solicitud"
        })
        
        return solicitud

    def register_sampling_session(self, db: Session, session_data: dict, muestras_data: list) -> Muestreo:
        # Create session
        muestreo = self.muestreo_repo.create(db, session_data)
        
        # Create individual samples in session
        for muestra_val in muestras_data:
            muestra_val["muestreo_id"] = muestreo.muestreo_id
            self.muestra_repo.create(db, muestra_val)
            
        # Update Solicitud Status to 'Completado' (3)
        solicitud = self.solicitud_repo.get(db, session_data["solicitud_muestreo_id"])
        if solicitud:
            self.solicitud_repo.update(db, solicitud, {"estado_solicitud_id": 3})
            self.historico_solicitud_repo.create(db, {
                "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
                "estado_solicitud_id": 3,
                "fecha": datetime.now(timezone.utc),
                "usuario_id": 1, # System/Default for now
                "observacion": f"Muestreo ejecutado (Sesión #{muestreo.muestreo_id})"
            })
            
        return muestreo

    def receive_sample(self, db: Session, recepcion_data: dict) -> Recepcion:
        # Business logic for receiving sample at lab
        recepcion = self.recepcion_repo.create(db, recepcion_data)

        # TRIGGER: If accepted, auto-create Analysis
        if recepcion.decision == "Aceptado" and self.analysis_service:
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
