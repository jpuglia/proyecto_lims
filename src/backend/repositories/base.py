from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from src.backend.models.base import Base
from src.backend.models.audit import AuditLog

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

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, options: Optional[List] = None, only_active: bool = False) -> List[T]:
        query = db.query(self.model)
        if only_active and hasattr(self.model, "activo"):
            query = query.filter(self.model.activo == True)
        if options:
            query = query.options(*options)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict, usuario_id: Optional[int] = None) -> T:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Audit insert
        if self.model != AuditLog:
            # Ensure obj_in is JSON serializable (dates to strings)
            from datetime import date, datetime
            audit_data = {}
            for k, v in obj_in.items():
                if isinstance(v, (datetime, date)):
                    v = v.isoformat()
                audit_data[k] = v
            self._log_audit(db, db_obj, "INSERT", None, audit_data, usuario_id)
            
        return db_obj

    def update(self, db: Session, db_obj: T, obj_in: dict, usuario_id: Optional[int] = None) -> T:
        valor_anterior = self._get_obj_dict(db_obj)
        
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        
        # Audit update
        if self.model != AuditLog:
            valor_nuevo = self._get_obj_dict(db_obj)
            self._log_audit(db, db_obj, "UPDATE", valor_anterior, valor_nuevo, usuario_id)
            
        return db_obj

    def delete(self, db: Session, id: int, usuario_id: Optional[int] = None) -> bool:
        db_obj = self.get(db, id)
        if not db_obj:
            return False
        
        valor_anterior = self._get_obj_dict(db_obj)
        
        # Soft-delete if the model has an 'activo' column
        if hasattr(db_obj, "activo"):
            setattr(db_obj, "activo", False)
            db.commit()
            db.refresh(db_obj)
            if self.model != AuditLog:
                self._log_audit(db, db_obj, "DELETE (SOFT)", valor_anterior, {"activo": False}, usuario_id)
        else:
            db.delete(db_obj)
            db.commit()
            if self.model != AuditLog:
                self._log_audit(db, db_obj, "DELETE (HARD)", valor_anterior, None, usuario_id)
        return True

    def get_by_filters(self, db: Session, **filters) -> List[T]:
        return db.query(self.model).filter_by(**filters).all()

    def get_column_map(self, db: Session, key_field: str = "codigo", value_field: str = None) -> dict:
        """
        Retorna un mapeo de {key_field: id} (o value_field si se provee).
        Util para resoluciones rápidas de FK.
        """
        primary_key = self.model.__mapper__.primary_key[0].name
        target_value = value_field if value_field else primary_key
        
        results = db.query(getattr(self.model, key_field), getattr(self.model, target_value)).all()
        return {str(k): v for k, v in results if k is not None}

    def _get_obj_dict(self, db_obj: T) -> Dict[str, Any]:
        """Helper to convert model instance to dict for audit logs."""
        from datetime import date, datetime
        data = {}
        for c in db_obj.__table__.columns:
            if hasattr(db_obj, c.key):
                val = getattr(db_obj, c.key)
                if isinstance(val, (datetime, date)):
                    val = val.isoformat()
                data[c.key] = val
        return data

    def _log_audit(self, db: Session, db_obj: T, operacion: str, anterior: Any, nuevo: Any, usuario_id: Optional[int]):
        """Internal helper to create audit records."""
        try:
            primary_key = self.model.__mapper__.primary_key[0].name
            registro_id = getattr(db_obj, primary_key)
            
            audit = AuditLog(
                tabla_nombre=self.model.__tablename__,
                registro_id=registro_id,
                operacion=operacion,
                valor_anterior=anterior,
                valor_nuevo=nuevo,
                usuario_id=usuario_id
            )
            db.add(audit)
            db.commit()
        except Exception as e:
            # We don't want audit failures to break the main transaction if it already committed
            # But here db.commit() might fail if the session is in a weird state.
            # In a real production system, we might use a separate session or a background task.
            print(f"Audit failed: {e}")
            db.rollback()
