# src/backend/services/recepcion_producto_service.py

from sqlalchemy.orm import Session

from src.backend.core.decorators.regulatory import (
    audit_trail,
    requiere_objeto_activo
)

from src.backend.repositories.recepcion_producto_repository import (
    RecepcionProductoRepository
)
from src.backend.repositories.producto_repository import ProductoRepository
from src.backend.services.recepcion_service import RecepcionService


class RecepcionProductoService:

    def __init__(
        self,
        repo: RecepcionProductoRepository,
        producto_repo: ProductoRepository,
        recepcion_service: RecepcionService
    ):
        self.repo = repo
        self.producto_repo = producto_repo
        self.recepcion_service = recepcion_service

    # ==========================================================

    @audit_trail(action="ASOCIACION_PRODUCTO_RECEPCION")
    @requiere_objeto_activo("producto_repo")
    def agregar(
        self,
        db: Session,
        recepcion_id: int,
        producto_id: int,
        lote: str,
        usuario_id: int
    ):
        if not lote or not lote.strip():
            raise ValueError("Lote obligatorio")

        self.recepcion_service.validar_tipo(
            db,
            recepcion_id,
            "PRODUCTO"
        )

        return self.repo.create(
            db,
            {
                "recepcion_id": recepcion_id,
                "producto_id": producto_id,
                "lote": lote.strip(),
            }
        )
