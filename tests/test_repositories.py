import pytest
from src.backend.repositories.auth import UsuarioRepository
from src.backend.repositories.dim import PlantaRepository, SistemaRepository
from src.backend.models.auth import Usuario
from src.backend.models.dim import Planta, Sistema

def test_usuario_repository_create(db_session):
    repo = UsuarioRepository()
    usuario_data = {
        "nombre": "Test User",
        "password_hash": "hashed_password",
        "firma": "T.U.",
        "activo": True
    }
    user = repo.create(db_session, usuario_data)
    assert user.usuario_id is not None
    assert user.nombre == "Test User"
    
    # Test get
    fetched_user = repo.get(db_session, user.usuario_id)
    assert fetched_user.nombre == "Test User"

def test_planta_repository_get_all(db_session):
    sistema_repo = SistemaRepository()
    sistema = sistema_repo.create(db_session, {"codigo": "S1", "nombre": "Sistema 1"})
    
    repo = PlantaRepository()
    planta_data = {"codigo": "P1", "nombre": "Planta 1", "sistema_id": sistema.sistema_id}
    repo.create(db_session, planta_data)
    
    plantas = repo.get_all(db_session)
    assert len(plantas) >= 1
    # Verificar que la planta recién creada existe en la lista
    nombres = [p.nombre for p in plantas]
    assert "Planta 1" in nombres

def test_usuario_repository_update(db_session):
    repo = UsuarioRepository()
    user = repo.create(db_session, {"nombre": "Old Name"})
    
    updated_user = repo.update(db_session, user, {"nombre": "New Name"})
    assert updated_user.nombre == "New Name"
    
    fetched_user = repo.get(db_session, user.usuario_id)
    assert fetched_user.nombre == "New Name"

def test_usuario_repository_delete(db_session):
    repo = UsuarioRepository()
    user = repo.create(db_session, {"nombre": "Delete Me"})
    user_id = user.usuario_id
    
    assert repo.delete(db_session, user_id) is True
    assert repo.get(db_session, user_id) is None
