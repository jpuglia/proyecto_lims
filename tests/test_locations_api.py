"""Tests para los endpoints de Ubicaciones – /api/ubicaciones/*
Schemas reales:
  PlantaCreate: codigo, nombre, sistema_id, activo (requeridos: codigo, nombre, sistema_id)
El router /api/ubicaciones solo tiene endpoints de Planta (no hay sistema endpoints aquí).
Nota: sistema_id es FK — usamos 1 como valor de prueba (el test puede fallar si hay
constraint de FK estricta; si falla, la BD de test tiene FK enforcement y debemos crear el sistema primero.
SQLite desactiva FKs por defecto, así que en test funciona con cualquier int.
"""
import pytest


def _planta_payload(n=1):
    return {
        "codigo": f"PLT-TEST-{n:03d}",
        "nombre": f"Planta de Prueba {n}",
        "sistema_id": 1,
        "activo": True,
    }


# ─── Tests ───────────────────────────────────────────────────────────────────

def test_list_plantas_empty(auth_client):
    """GET /api/ubicaciones/plantas retorna lista (puede no ser vacía según orden de tests)."""
    response = auth_client.get("/api/ubicaciones/plantas")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_planta(auth_client):
    """POST /api/ubicaciones/plantas crea una planta correctamente."""
    response = auth_client.post("/api/ubicaciones/plantas", json=_planta_payload(10))
    assert response.status_code == 201
    data = response.json()
    assert "planta_id" in data
    assert data["nombre"] == "Planta de Prueba 10"


def test_get_planta_by_id(auth_client):
    """GET /api/ubicaciones/plantas/{id} retorna la planta correcta."""
    create_resp = auth_client.post("/api/ubicaciones/plantas", json=_planta_payload(20))
    assert create_resp.status_code == 201
    planta_id = create_resp.json()["planta_id"]

    response = auth_client.get(f"/api/ubicaciones/plantas/{planta_id}")
    assert response.status_code == 200
    assert response.json()["planta_id"] == planta_id


def test_get_planta_not_found(auth_client):
    """GET /api/ubicaciones/plantas/{id} retorna 404 si no existe."""
    response = auth_client.get("/api/ubicaciones/plantas/99999")
    assert response.status_code == 404


def test_update_planta(auth_client):
    """PUT /api/ubicaciones/plantas/{id} actualiza el nombre."""
    create_resp = auth_client.post("/api/ubicaciones/plantas", json=_planta_payload(30))
    assert create_resp.status_code == 201
    planta_id = create_resp.json()["planta_id"]

    update_resp = auth_client.put(
        f"/api/ubicaciones/plantas/{planta_id}",
        json={"nombre": "Planta Actualizada por Test"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["nombre"] == "Planta Actualizada por Test"


def test_update_planta_not_found(auth_client):
    """PUT /api/ubicaciones/plantas/{id} retorna 404 si no existe."""
    response = auth_client.put(
        "/api/ubicaciones/plantas/99999",
        json={"nombre": "No Existe"},
    )
    assert response.status_code == 404


def test_delete_planta(auth_client):
    """DELETE /api/ubicaciones/plantas/{id} elimina correctamente."""
    create_resp = auth_client.post("/api/ubicaciones/plantas", json=_planta_payload(40))
    assert create_resp.status_code == 201
    planta_id = create_resp.json()["planta_id"]

    delete_resp = auth_client.delete(f"/api/ubicaciones/plantas/{planta_id}")
    assert delete_resp.status_code == 204

    get_resp = auth_client.get(f"/api/ubicaciones/plantas/{planta_id}")
    assert get_resp.status_code == 404


def test_locations_requires_auth(client):
    """Los endpoints protegidos retornan 401 sin token JWT."""
    response = client.get("/api/ubicaciones/plantas")
    assert response.status_code == 401
