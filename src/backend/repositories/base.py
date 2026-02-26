from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from src.backend.models.base import Base

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    def get(self, db: Session, id: int, options: Optional[List] = None) -> Optional[T]:
        primary_key = self.model.__mapper__.primary_key[0].name
        query = db.query(self.model)
        if options:
            query = query.options(*options)
        return query.filter(getattr(self.model, primary_key) == id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, options: Optional[List] = None) -> List[T]:
        query = db.query(self.model)
        if options:
            query = query.options(*options)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict) -> T:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: T, obj_in: dict) -> T:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> bool:
        db_obj = self.get(db, id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False
