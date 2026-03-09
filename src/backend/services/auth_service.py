from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session


from src.backend.repositories.auth import UsuarioRepository
from src.backend.repositories.audit import AuditLogRepository
from src.backend.models.auth import Usuario

class AuthService:
    def __init__(self, usuario_repo: UsuarioRepository, audit_repo: AuditLogRepository):
        self.usuario_repo = usuario_repo
        self.audit_repo = audit_repo

    def create_usuario(self, db: Session, user_data: dict, current_user_id: Optional[int] = None) -> Usuario:
        # Business logic for user creation
        nuevo_usuario = self.usuario_repo.create(db, user_data)
        
        # Audit trail: if first user, use its own ID for auditing
        audit_uid = current_user_id if current_user_id else nuevo_usuario.usuario_id

        self.audit_repo.create(db, {
            "tabla_nombre": "usuario",
            "registro_id": nuevo_usuario.usuario_id,
            "operacion": "INSERT",
            "valor_anterior": None,
            "valor_nuevo": {"nombre": nuevo_usuario.nombre, "activo": nuevo_usuario.activo},
            "usuario_id": audit_uid
        })
        
        return nuevo_usuario

    def get_usuario(self, db: Session, usuario_id: int) -> Optional[Usuario]:
        return self.usuario_repo.get(db, usuario_id)

    # Note: Authentication procedures (like hashing passwords, decoding JWT, etc.) 
    # would be implemented here or in a dedicated security module.
