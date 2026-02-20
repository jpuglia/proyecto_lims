# BaseRepository
from typing import Type, TypeVar, Generic, List, Optional, Dict, Any

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from src.backend.models.base import Base


T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """
    Repositorio base de infraestructura.

    NO contiene lógica regulatoria.
    NO contiene auditoría.
    NO contiene soft delete.

    Solo provee operaciones CRUD técnicas.
    """

    model: Type[T]
    editable_fields: set[str] = set()

    def __init__(self):
        if not hasattr(self, "model"):
            raise Exception("Model not defined")

    # =========================
    # CREATE
    # =========================
    def create(self, db: Session, data: Dict[str, Any]) -> T:
        try:
            obj = self.model(**data)
            db.add(obj)
            db.flush()
            return obj
        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # READ
    # =========================
    def get_by_id(self, db: Session, obj_id: int) -> Optional[T]:
        return db.get(self.model, obj_id)

    def get_all(self, db: Session) -> List[T]:
        return db.query(self.model).all()

    def get_by_filters(self, db: Session, **filters: Any) -> List[T]:
        query = db.query(self.model)

        for field, value in filters.items():
            if hasattr(self.model, field):
                query = query.filter(getattr(self.model, field) == value)

        return query.all()

    # =========================
    # UPDATE
    # =========================
    def update(self, db: Session, obj: T, data: Dict[str, Any]) -> T:
        try:
            for field, value in data.items():
                if field in self.editable_fields:
                    setattr(obj, field, value)

            db.flush()
            return obj

        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # DELETE (FÍSICO)
    # =========================
    def delete(self, db: Session, obj: T) -> None:
        try:
            db.delete(obj)
            db.flush()
        except SQLAlchemyError:
            db.rollback()
            raise

    # =========================
    # EXISTS
    # =========================
    def exists(self, db: Session, **filters: Any) -> bool:
        query = db.query(self.model)

        for field, value in filters.items():
            if hasattr(self.model, field):
                query = query.filter(getattr(self.model, field) == value)

        return db.query(query.exists()).scalar()

    # =========================
    # COUNT
    # =========================
    def count(self, db: Session) -> int:
        return db.query(self.model).count()


