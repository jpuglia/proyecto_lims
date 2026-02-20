# src/backend/services/recepcion_hisopo_service.py

from sqlalchemy.orm import Session

from src.backend.core.decorators.regulatory import audit_trail
from src.backend.repositories.recepcion_hisopo_repository import (
    RecepcionHisopoRepository
)
from src.backend.services.recepcion_service import RecepcionService


class RecepcionHisopoService:

    def __init__(
        self,
        repo: RecepcionHisopoRepository,
        recepcion_service: RecepcionService
    ):
        self.repo = repo
        self.recepcion_service = recepcion_service

    # ==========================================================

    @audit_trail(action="ASOCIACION_HISOPO_RECEPCION")
    def agregar(
        self,
        db: Session,
        recepcion_id: int,
        planta_id: int,
        usuario_id: int
    ):
        self.recepcion_service.validar_tipo(
            db,
            recepcion_id,
            "HISOPO"
        )

        return self.repo.create(
            db,
            {
                "recepcion_id": recepcion_id,
                "planta_id": planta_id,
            }
        )
