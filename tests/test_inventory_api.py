"""Tests para los endpoints de Inventario – /api/inventario/*
Schemas reales:
  PolvoSuplementoCreate: codigo (req), nombre (req), unidad (req), activo (bool, default True)
  PolvoSuplementoResponse: polvo_suplemento_id (NOT polvo_id)
  MedioPreparadoCreate: codigo (req), nombre (req), activo (bool, default True)
  MedioPreparadoResponse: medio_preparado_id
  StockMediosResponse: stock_medios_id, orden_preparacion_medio_id, lote_interno, vence, estado_qc_id
"""
import pytest


def _polvo_payload(n=1):
    return {
        "codigo": f"POLVO-TEST-{n:03d}",
        "nombre": f"Agar Test {n}",
        "unidad": "gramos",
        "activo": True,
    }


def _medio_payload(n=1):
    return {
        "codigo": f"MP-TEST-{n:03d}",
        "nombre": f"Medio Test {n}",
        "activo": True,
    }


# ─── Polvos / Suplementos ────────────────────────────────────────────────────

def test_list_polvos_empty(auth_client):
    """GET /api/inventario/polvos retorna lista."""
    response = auth_client.get("/api/inventario/polvos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_polvo(auth_client):
    """POST /api/inventario/polvos crea un polvo/suplemento correctamente."""
    response = auth_client.post("/api/inventario/polvos", json=_polvo_payload(10))
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Agar Test 10"
    assert "polvo_suplemento_id" in data


def test_update_polvo(auth_client):
    """PUT /api/inventario/polvos/{id} actualiza los campos correctamente."""
    create_resp = auth_client.post("/api/inventario/polvos", json=_polvo_payload(20))
    assert create_resp.status_code == 201
    polvo_id = create_resp.json()["polvo_suplemento_id"]

    update_resp = auth_client.put(
        f"/api/inventario/polvos/{polvo_id}",
        json={"nombre": "Polvo Actualizado por Test"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["nombre"] == "Polvo Actualizado por Test"


def test_update_polvo_not_found(auth_client):
    """PUT /api/inventario/polvos/{id} retorna 404 si no existe."""
    response = auth_client.put(
        "/api/inventario/polvos/99999",
        json={"nombre": "No Existe"},
    )
    assert response.status_code == 404


def test_delete_polvo(auth_client):
    """DELETE /api/inventario/polvos/{id} elimina correctamente."""
    create_resp = auth_client.post("/api/inventario/polvos", json=_polvo_payload(30))
    assert create_resp.status_code == 201
    polvo_id = create_resp.json()["polvo_suplemento_id"]

    delete_resp = auth_client.delete(f"/api/inventario/polvos/{polvo_id}")
    assert delete_resp.status_code == 204


def test_delete_polvo_not_found(auth_client):
    """DELETE /api/inventario/polvos/{id} retorna 404 si no existe."""
    response = auth_client.delete("/api/inventario/polvos/99999")
    assert response.status_code == 404


# ─── Medios Preparados ───────────────────────────────────────────────────────

def test_list_medios_empty(auth_client):
    """GET /api/inventario/medios retorna lista."""
    response = auth_client.get("/api/inventario/medios")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_medio(auth_client):
    """POST /api/inventario/medios crea un medio preparado correctamente."""
    response = auth_client.post("/api/inventario/medios", json=_medio_payload(10))
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Medio Test 10"
    assert "medio_preparado_id" in data


def test_update_medio(auth_client):
    """PUT /api/inventario/medios/{id} actualiza campos."""
    create_resp = auth_client.post("/api/inventario/medios", json=_medio_payload(20))
    assert create_resp.status_code == 201
    medio_id = create_resp.json()["medio_preparado_id"]

    update_resp = auth_client.put(
        f"/api/inventario/medios/{medio_id}",
        json={"nombre": "Medio Actualizado Test"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["nombre"] == "Medio Actualizado Test"


# ─── Stock de Medios ──────────────────────────────────────────────────────────

def test_list_stock(auth_client):
    """GET /api/inventario/stock retorna lista (puede estar vacía)."""
    response = auth_client.get("/api/inventario/stock")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ─── Auth Guard ───────────────────────────────────────────────────────────────

def test_inventory_requires_auth(client):
    """Los endpoints protegidos retornan 401 sin token JWT."""
    response = client.get("/api/inventario/polvos")
    assert response.status_code == 401
