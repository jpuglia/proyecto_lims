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
                 recepcion_repo: RecepcionRepository):
        self.solicitud_repo = solicitud_repo
        self.historico_solicitud_repo = historico_solicitud_repo
        self.muestreo_repo = muestreo_repo
        self.muestra_repo = muestra_repo
        self.envio_repo = envio_repo
        self.recepcion_repo = recepcion_repo

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
            
        return muestreo

    def receive_sample(self, db: Session, recepcion_data: dict) -> Recepcion:
        # Business logic for receiving sample at lab
        recepcion = self.recepcion_repo.create(db, recepcion_data)
        return recepcion
