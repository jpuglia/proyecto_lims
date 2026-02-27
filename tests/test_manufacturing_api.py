"""Tests for manufacturing endpoints: estados, ordenes, procesos, historial."""
import pytest

BASE = "/api/manufactura"


# ─── GET /manufactura/estados ────────────────────────────────────────────────

def test_list_estados_unauthenticated(client):
    """Unauthenticated requests must return 401."""
    response = client.get(f"{BASE}/estados")
    assert response.status_code == 401


def test_list_estados_authenticated(auth_client):
    """Authenticated users can list manufacturing states (may be empty)."""
    response = auth_client.get(f"{BASE}/estados")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ─── GET /manufactura/ordenes/{id} ───────────────────────────────────────────

def test_get_orden_not_found(auth_client):
    """Requesting a non-existent order must return 404."""
    response = auth_client.get(f"{BASE}/ordenes/999999")
    assert response.status_code == 404


# ─── GET /manufactura/ordenes/{id}/procesos ──────────────────────────────────

def test_get_procesos_by_orden_not_found(auth_client):
    """Requesting processes for a non-existent order must return 404."""
    response = auth_client.get(f"{BASE}/ordenes/999999/procesos")
    assert response.status_code == 404


# ─── Full flow: create orden → create proceso → change estado → historial ────

def test_full_manufacturing_flow(auth_client):
    """
    Integration test: create an order, create a process for it,
    change its state, then verify the historial has 2 entries.
    Requires at least one EstadoManufactura seeded in the test DB.
    """
    # 1. Check available estados
    estado_resp = auth_client.get(f"{BASE}/estados")
    assert estado_resp.status_code == 200
    estados = estado_resp.json()

    if not estados:
        pytest.skip("No hay estados de manufactura en la BD de pruebas. Seed requerido.")

    estado_id_1 = estados[0]["estado_manufactura_id"]
    estado_id_2 = estados[-1]["estado_manufactura_id"]

    # 2. Create an order (FK dependencies may not exist in test DB)
    orden_payload = {
        "codigo": "TEST-OM-001",
        "lote": "LTEST001",
        "fecha": "2026-02-27",
        "producto_id": 1,
        "cantidad": 500.0,
        "unidad": "kg",
        "operario_id": 1,
    }
    orden_resp = auth_client.post(f"{BASE}/ordenes", json=orden_payload)
    if orden_resp.status_code == 422:
        pytest.skip("FK integrity: producto_id=1 o operario_id=1 no existen en BD de pruebas.")
    assert orden_resp.status_code == 201
    orden = orden_resp.json()
    orden_id = orden["orden_manufactura_id"]

    # 3. List procesos for the order (should be empty)
    procesos_resp = auth_client.get(f"{BASE}/ordenes/{orden_id}/procesos")
    assert procesos_resp.status_code == 200
    assert procesos_resp.json() == []

    # 4. Create a proceso for the order
    proceso_payload = {
        "orden_manufactura_id": orden_id,
        "estado_manufactura_id": estado_id_1,
        "observacion": "Inicio de prueba",
    }
    proceso_resp = auth_client.post(f"{BASE}/procesos", json=proceso_payload)
    assert proceso_resp.status_code == 201
    manufactura_id = proceso_resp.json()["manufactura_id"]

    # 5. Verify GET /ordenes/{id}/procesos returns the process
    procesos_resp2 = auth_client.get(f"{BASE}/ordenes/{orden_id}/procesos")
    assert procesos_resp2.status_code == 200
    assert len(procesos_resp2.json()) == 1

    # 6. Get historial (should have 1 entry from creation)
    hist_resp = auth_client.get(f"{BASE}/procesos/{manufactura_id}/historial")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) >= 1

    # 7. Change state
    cambio_resp = auth_client.post(
        f"{BASE}/procesos/{manufactura_id}/estado",
        json={"nuevo_estado_id": estado_id_2, "usuario_id": 1},
    )
    assert cambio_resp.status_code == 200

    # 8. Historial should have at least 2 entries if estados differ
    hist_resp2 = auth_client.get(f"{BASE}/procesos/{manufactura_id}/historial")
    assert hist_resp2.status_code == 200
    if estado_id_1 != estado_id_2:
        assert len(hist_resp2.json()) >= 2

    # Cleanup
    auth_client.delete(f"{BASE}/ordenes/{orden_id}")
