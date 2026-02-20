# src/backend/core/decorators/regulatory.py

from functools import wraps
from datetime import datetime, timezone
from sqlalchemy import inspect

from src.backend.models.audit.audit_trail import AuditTrail


def audit_trail(action: str):
    """
    Audit trail regulatorio 21 CFR Part 11 compliant.
    Registra cambios campo por campo.
    """

    def decorator(func):

        @wraps(func)
        def wrapper(self, db, *args, **kwargs):

            usuario_id = kwargs.get("usuario_id")

            if not usuario_id:
                raise ValueError("usuario_id obligatorio para auditoría")

            # Capturar estado previo (si aplica)
            obj = kwargs.get("obj") if "obj" in kwargs else None
            before_state = {}
            if obj:
                inspector = inspect(obj)
                for attr in inspector.attrs:
                    before_state[attr.key] = getattr(obj, attr.key)

            result = func(self, db, *args, **kwargs)

            # Registrar cambios
            inspector = inspect(result)

            for attr in inspector.attrs:

                field = attr.key
                old_val = before_state.get(field)
                new_val = getattr(result, field)

                if old_val != new_val or action in ("CREATE", "SOFT_DELETE"):

                    audit = AuditTrail(
                        tabla=result.__class__.__name__,
                        registro_id=result.id,
                        columna=field,
                        old_val=str(old_val) if old_val is not None else None,
                        new_val=str(new_val) if new_val is not None else None,
                        accion=action,
                        timestamp=datetime.now(timezone.utc),
                        usuario_id=usuario_id
                    )

                    db.add(audit)

            db.flush()

            return result

        return wrapper

    return decorator

# src/backend/core/decorators/regulatory.py

def ensure_active(func):

    @wraps(func)
    def wrapper(self, db, obj, *args, **kwargs):

        if hasattr(obj, "activo") and not obj.activo:
            raise Exception(
                f"No se puede operar sobre un registro inactivo: {obj.id}"
            )

        return func(self, db, obj, *args, **kwargs)

    return wrapper

