import pytest
from fastapi.testclient import TestClient
from src.backend.api.app import app
from src.backend.api.dependencies import get_db

@pytest.fixture
def client(db_session):
    # Override get_db dependency to use the test session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "LIMS URUFARMA API v0.1.0"}

def test_get_users_empty(client):
    response = client.get("/api/auth/usuarios")
    # This assumes the auth router is implemented and has this GET endpoint
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 0

def test_create_user_endpoint(client):
    usuario_data = {
        "nombre": "API User",
        "password": "securepassword",
        "firma": "A.U.",
        "activo": True
    }
    response = client.post("/api/auth/usuarios", json=usuario_data)
    assert response.status_code == 201
    assert response.json()["nombre"] == "API User"

def test_error_handler_not_found(client):
    """Verify that 404 errors return the standardized JSON format."""
    response = client.get("/api/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "detail" in data
    assert data["error"] == "Error de HTTP"
