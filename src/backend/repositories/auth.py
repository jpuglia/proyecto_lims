from sqlalchemy.orm import Session
from typing import Optional

from src.backend.repositories.base import BaseRepository
from src.backend.models.auth import Usuario, Rol, UsuarioRol, AuditTrail, Revision, Operario, Laboratorio, UsuarioLaboratorio

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self):
        super().__init__(Usuario)

    def get_by_nombre(self, db: Session, nombre: str) -> Optional[Usuario]:
        return db.query(self.model).filter(self.model.nombre == nombre).first()
        
    def sync_roles(self, db: Session, usuario_id: int, roles_ids: list[int]):
        db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id).delete()
        for r_id in roles_ids:
            nuevo_rol = UsuarioRol(usuario_id=usuario_id, rol_id=r_id)
            db.add(nuevo_rol)
        db.commit()

    def sync_laboratorios(self, db: Session, usuario_id: int, laboratorios_ids: list[int]):
        db.query(UsuarioLaboratorio).filter(UsuarioLaboratorio.usuario_id == usuario_id).delete()
        for lab_id in laboratorios_ids:
            nuevo_lab = UsuarioLaboratorio(usuario_id=usuario_id, laboratorio_id=lab_id)
            db.add(nuevo_lab)
        db.commit()

class RolRepository(BaseRepository[Rol]):
    def __init__(self):
        super().__init__(Rol)

class LaboratorioRepository(BaseRepository[Laboratorio]):
    def __init__(self):
        super().__init__(Laboratorio)

class UsuarioLaboratorioRepository(BaseRepository[UsuarioLaboratorio]):
    def __init__(self):
        super().__init__(UsuarioLaboratorio)

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
