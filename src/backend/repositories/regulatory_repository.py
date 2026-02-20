#src/backend/repositories/regulatory_repository.py


from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Type, Generic, TypeVar

from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.audit.base_model import RegulatoryBase

R = TypeVar("R", bound=RegulatoryBase)


class RegulatoryRepository(BaseRepository[R], Generic[R]):
    """
    Repositorio base para entidades regulatorias.
    Implementa soft delete obligatorio.
    """

    model: Type[R]

    def delete(
        self,
        db: Session,
        obj: R,
        usuario_id: int
    ) -> None:
        """
        Soft delete regulatorio (21 CFR compliant).
        """

        try:
            obj.desactivar(usuario_id)
            db.flush()

        except SQLAlchemyError:
            db.rollback()
            raise
