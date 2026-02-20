# src/backend/services/recepcion_servicio_service.py

from sqlalchemy.orm import Session

from src.backend.core.decorators.regulatory import audit_trail
from src.backend.repositories.recepcion_servicio_repository import (
    RecepcionServicioRepository
)
from src.backend.services.recepcion_service import RecepcionService


class RecepcionServicioService:

    def __init__(
        self,
        repo: RecepcionServicioRepository,
        recepcion_service: RecepcionService
    ):
        self.repo = repo
        self.recepcion_service = recepcion_service

    # ==========================================================

    @audit_trail(action="ASOCIACION_SERVICIO_RECEPCION")
    def agregar(
        self,
        db: Session,
        recepcion_id: int,
        sistema_id: int,
        usuario_id: int
    ):
        self.recepcion_service.validar_tipo(
            db,
            recepcion_id,
            "SERVICIO"
        )

        return self.repo.create(
            db,
            {
                "recepcion_id": recepcion_id,
                "sistema_id": sistema_id,
            }
        )
