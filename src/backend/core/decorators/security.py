from functools import wraps
from sqlalchemy.orm import Session

from src.backend.models.auth.rol import Rol
from src.backend.models.auth.usuario_rol import UsuarioRol
from src.backend.models.auth.rol_permiso import RolPermiso
from src.backend.models.auth.permiso import Permiso


def requiere_permiso(codigo_permiso: str):
    """
    Control granular por permiso.
    Compatible con arquitectura regulatoria.
    """

    def decorator(func):

        @wraps(func)
        def wrapper(self, db: Session, *args, **kwargs):

            usuario_id = kwargs.get("usuario_id")

            if not usuario_id:
                raise ValueError("usuario_id obligatorio para autorización")

            permiso = (
                db.query(Permiso)
                .filter(Permiso.codigo == codigo_permiso)
                .first()
            )

            if not permiso:
                raise PermissionError(
                    f"Permiso no configurado: {codigo_permiso}"
                )

            permiso_valido = (
                db.query(RolPermiso)
                .join(Rol, Rol.id == RolPermiso.rol_id)
                .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
                .filter(
                    UsuarioRol.usuario_id == usuario_id,
                    RolPermiso.permiso_id == permiso.id
                )
                .first()
            )

            if not permiso_valido:
                raise PermissionError(
                    f"Acceso denegado. Permiso requerido: {codigo_permiso}"
                )

            return func(self, db, *args, **kwargs)

        return wrapper

    return decorator
