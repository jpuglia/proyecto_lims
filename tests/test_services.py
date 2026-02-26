import pytest
from src.backend.services.auth_service import AuthService
from src.backend.repositories.auth import UsuarioRepository, AuditTrailRepository

def test_auth_service_create_usuario(db_session):
    usuario_repo = UsuarioRepository()
    audit_repo = AuditTrailRepository()
    service = AuthService(usuario_repo, audit_repo)
    
    # Create a user to act as current_user for audit purposes
    admin = usuario_repo.create(db_session, {"nombre": "Admin"})
    
    user_data = {"nombre": "Service User", "password_hash": "hashed"}
    user = service.create_usuario(db_session, user_data, admin.usuario_id)
    
    assert user.usuario_id is not None
    assert user.nombre == "Service User"
    
    # Verify audit trail was created
    audits = audit_repo.get_all(db_session)
    assert len(audits) >= 1
    assert audits[-1].tabla == "usuario"
    assert audits[-1].usuario_id == admin.usuario_id
