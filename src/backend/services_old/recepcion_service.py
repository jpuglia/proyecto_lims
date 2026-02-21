# src/backend/services/recepcion_service.py

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from src.backend.core.decorators.regulatory import audit_trail
from src.backend.repositories.recepcion_repository import RecepcionRepository

from typing import cast

class RecepcionService:

    TIPOS_VALIDOS = {"PRODUCTO", "SERVICIO", "HISOPO"}

    def __init__(
        self,
        recepcion_repo: RecepcionRepository
    ):
        self.recepcion_repo = recepcion_repo

    # ==========================================================
    # CREAR RECEPCION BASE
    # ==========================================================

    @audit_trail(action="CREACION_RECEPCION")
    def crear(
        self,
        db: Session,
        tipo: str,
        usuario_id: int
    ):
        if tipo not in self.TIPOS_VALIDOS:
            raise ValueError("Tipo de recepción inválido")

        return self.recepcion_repo.create(
            db,
            {
                "tipo": tipo,
                "fecha": datetime.now(timezone.utc),
                "usuario_id": usuario_id,
                "decision": None,
            }
        )

    # ==========================================================
    # VALIDAR TIPO
    # ==========================================================

    def validar_tipo(
        self,
        db: Session,
        recepcion_id: int,
        tipo_esperado: str
    ):
        recepcion = self.recepcion_repo.get_by_id(db, recepcion_id)

        if not recepcion:
            raise ValueError("Recepción inexistente")

        if cast(str, recepcion.tipo) != tipo_esperado:
            raise ValueError(
                f"La recepción no es de tipo {tipo_esperado}"
            )

        return recepcion
