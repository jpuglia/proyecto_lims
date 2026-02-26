"""Tests para los endpoints de Análisis – /api/analisis/*
Schemas reales de AnalisisCreate:
  muestra_id: int, recepcion_id: int, metodo_version_id: int,
  estado_analisis_id: int, operario_id: int, especificacion_id (opt), fecha_inicio (opt)

Como estos son FKs a tablas complejas (muestras, recepciones, métodos),
en SQLite sin FK enforcement podemos usar IDs ficticios.
Los tests verifican el comportamiento HTTP del router.
"""
import pytest


def _analisis_payload():
    """Payload mínimo válido según AnalisisCreate schema."""
    return {
        "muestra_id": 1,
        "recepcion_id": 1,
        "metodo_version_id": 1,
        "estado_analisis_id": 1,
        "operario_id": 1,
    }


# ─── Tests ───────────────────────────────────────────────────────────────────

def test_list_analisis_empty(auth_client):
    """GET /api/analisis/ retorna lista (puede no estar vacía según orden de tests)."""
    response = auth_client.get("/api/analisis/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_analisis(auth_client):
    """POST /api/analisis/ crea un análisis correctamente."""
    response = auth_client.post("/api/analisis/", json=_analisis_payload())
    assert response.status_code == 201
    data = response.json()
    assert "analisis_id" in data
    assert data["muestra_id"] == 1


def test_get_analisis_by_id(auth_client):
    """GET /api/analisis/{id} retorna el análisis correcto."""
    create_resp = auth_client.post("/api/analisis/", json=_analisis_payload())
    assert create_resp.status_code == 201
    analisis_id = create_resp.json()["analisis_id"]

    response = auth_client.get(f"/api/analisis/{analisis_id}")
    assert response.status_code == 200
    assert response.json()["analisis_id"] == analisis_id


def test_get_analisis_not_found(auth_client):
    """GET /api/analisis/{id} retorna 404 si no existe."""
    response = auth_client.get("/api/analisis/99999")
    assert response.status_code == 404


def test_update_analisis(auth_client):
    """PUT /api/analisis/{id} actualiza campos del análisis."""
    create_resp = auth_client.post("/api/analisis/", json=_analisis_payload())
    assert create_resp.status_code == 201
    analisis_id = create_resp.json()["analisis_id"]

    update_resp = auth_client.put(
        f"/api/analisis/{analisis_id}",
        json={"estado_analisis_id": 2},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["estado_analisis_id"] == 2


def test_update_analisis_not_found(auth_client):
    """PUT /api/analisis/{id} retorna 404 si no existe."""
    response = auth_client.put(
        "/api/analisis/99999",
        json={"estado_analisis_id": 2},
    )
    assert response.status_code == 404


def test_delete_analisis(auth_client):
    """DELETE /api/analisis/{id} elimina correctamente el análisis."""
    create_resp = auth_client.post("/api/analisis/", json=_analisis_payload())
    assert create_resp.status_code == 201
    analisis_id = create_resp.json()["analisis_id"]

    delete_resp = auth_client.delete(f"/api/analisis/{analisis_id}")
    assert delete_resp.status_code == 204

    get_resp = auth_client.get(f"/api/analisis/{analisis_id}")
    assert get_resp.status_code == 404


def test_delete_analisis_not_found(auth_client):
    """DELETE /api/analisis/{id} retorna 404 si no existe."""
    response = auth_client.delete("/api/analisis/99999")
    assert response.status_code == 404


def test_analysis_requires_auth(client):
    """Los endpoints protegidos retornan 401 sin token JWT."""
    response = client.get("/api/analisis/")
    assert response.status_code == 401
