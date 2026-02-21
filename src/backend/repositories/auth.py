from sqlalchemy.orm import Session
from typing import Optional

from src.backend.repositories.base import BaseRepository
from src.backend.models.auth import Usuario, Rol, UsuarioRol, AuditTrail, Revision, Operario

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self):
        super().__init__(Usuario)

    def get_by_nombre(self, db: Session, nombre: str) -> Optional[Usuario]:
        return db.query(self.model).filter(self.model.nombre == nombre).first()

class RolRepository(BaseRepository[Rol]):
    def __init__(self):
        super().__init__(Rol)

class UsuarioRolRepository(BaseRepository[UsuarioRol]):
    def __init__(self):
        super().__init__(UsuarioRol)

class AuditTrailRepository(BaseRepository[AuditTrail]):
    def __init__(self):
        super().__init__(AuditTrail)

class RevisionRepository(BaseRepository[Revision]):
    def __init__(self):
        super().__init__(Revision)

class OperarioRepository(BaseRepository[Operario]):
    def __init__(self):
        super().__init__(Operario)
        
    def get_by_codigo_empleado(self, db: Session, codigo: str) -> Optional[Operario]:
        return db.query(self.model).filter(self.model.codigo_empleado == codigo).first()
