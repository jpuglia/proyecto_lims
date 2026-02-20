from typing import TypeVar, Type, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from src.backend.models.audit.base_model import RegulatoryBase
from src.backend.repositories.base_repository import BaseRepository
from src.backend.core.decorators.regulatory import audit_trail

R = TypeVar("R", bound=RegulatoryBase)


class RegulatoryRepository(BaseRepository[R]):

    model: Type[R]

    # Campos que cada repositorio hijo debe definir
    editable_fields: set[str] = set()

    # =========================
    # CREATE
    # =========================
    @audit_trail("CREATE")
    def create(
        self,
        db: Session,
        data: Dict[str, Any],
        usuario_id: int
    ) -> R:

        if not usuario_id:
            raise ValueError("usuario_id es obligatorio")

        try:
            obj = self.model(**data)
            obj.creado_por = usuario_id

            db.add(obj)
            db.flush()

            return obj

        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # UPDATE SEGURO
    # =========================
    @audit_trail("UPDATE")
    def update(
        self,
        db: Session,
        obj: R,
        data: Dict[str, Any],
        usuario_id: int
    ) -> R:

        if not usuario_id:
            raise ValueError("usuario_id es obligatorio")

        if not self.editable_fields:
            raise Exception(
                f"{self.__class__.__name__} no define editable_fields"
            )

        try:
            for field, value in data.items():

                # Validación 1: el campo existe en el modelo
                if not hasattr(obj, field):
                    raise ValueError(
                        f"Campo inválido para {self.model.__name__}: {field}"
                    )

                # Validación 2: el campo es editable
                if field not in self.editable_fields:
                    raise ValueError(
                        f"Campo no editable regulatoriamente: {field}"
                    )

                setattr(obj, field, value)

            # Actualización metadata regulatoria
            obj.modificado_por = usuario_id

            db.flush()

            return obj

        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # SOFT DELETE
    # =========================
    @audit_trail("SOFT_DELETE")
    def delete(
        self,
        db: Session,
        obj: R,
        usuario_id: int
    ) -> R:

        if not usuario_id:
            raise ValueError("usuario_id es obligatorio")

        try:
            obj.desactivar(usuario_id)
            db.flush()
            return obj

        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # DELETE FISICO PROHIBIDO
    # =========================
    def hard_delete(self, *args, **kwargs):
        raise Exception(
            "El delete físico está prohibido en entidades regulatorias"
        )
