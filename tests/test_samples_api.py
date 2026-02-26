"""Tests para los endpoints de Muestreo – /api/muestreo/*
Schemas reales:
  SolicitudMuestreoCreate: usuario_id, tipo, estado_solicitud_id (requeridos)
"""
import pytest


def _create_user(auth_client, nombre):
    """Helper: crea un usuario y retorna su usuario_id."""
    resp = auth_client.post(
        "/api/auth/usuarios",
        json={"nombre": nombre, "password": "pass12345", "firma": "X.X.", "activo": True},
    )
    assert resp.status_code == 201, f"No se pudo crear usuario: {resp.text}"
    return resp.json()["usuario_id"]


def _solicitud_payload(usuario_id):
    return {
        "usuario_id": usuario_id,
        "tipo": "Ambiental",
        "estado_solicitud_id": 1,
    }


# ─── Tests ───────────────────────────────────────────────────────────────────

def test_list_solicitudes_empty(auth_client):
    """GET /api/muestreo/solicitudes retorna lista cuando no hay datos (puede no ser vacía si otros tests corrieron)."""
    response = auth_client.get("/api/muestreo/solicitudes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_solicitud(auth_client):
    """POST /api/muestreo/solicitudes crea una solicitud correctamente."""
    uid = _create_user(auth_client, "op_create_sol")
    response = auth_client.post("/api/muestreo/solicitudes", json=_solicitud_payload(uid))
    assert response.status_code == 201
    data = response.json()
    assert data["tipo"] == "Ambiental"
    assert "solicitud_muestreo_id" in data


def test_list_solicitudes_after_create(auth_client):
    """GET /api/muestreo/solicitudes retorna al menos una solicitud tras crearla."""
    uid = _create_user(auth_client, "op_list_sol")
    auth_client.post("/api/muestreo/solicitudes", json=_solicitud_payload(uid))
    response = auth_client.get("/api/muestreo/solicitudes")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_update_solicitud(auth_client):
    """PUT /api/muestreo/solicitudes/{id} actualiza la observación."""
    uid = _create_user(auth_client, "op_update_sol")
    create_resp = auth_client.post("/api/muestreo/solicitudes", json=_solicitud_payload(uid))
    assert create_resp.status_code == 201
    solicitud_id = create_resp.json()["solicitud_muestreo_id"]

    update_resp = auth_client.put(
        f"/api/muestreo/solicitudes/{solicitud_id}",
        json={"observacion": "Observación actualizada por test"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["observacion"] == "Observación actualizada por test"


def test_update_solicitud_not_found(auth_client):
    """PUT /api/muestreo/solicitudes/{id} retorna 404 si no existe."""
    response = auth_client.put(
        "/api/muestreo/solicitudes/99999",
        json={"observacion": "no existe"},
    )
    assert response.status_code == 404


def test_delete_solicitud(auth_client):
    """DELETE /api/muestreo/solicitudes/{id} elimina correctamente."""
    uid = _create_user(auth_client, "op_del_sol")
    create_resp = auth_client.post("/api/muestreo/solicitudes", json=_solicitud_payload(uid))
    assert create_resp.status_code == 201
    solicitud_id = create_resp.json()["solicitud_muestreo_id"]

    delete_resp = auth_client.delete(f"/api/muestreo/solicitudes/{solicitud_id}")
    assert delete_resp.status_code == 204


def test_delete_solicitud_not_found(auth_client):
    """DELETE /api/muestreo/solicitudes/{id} retorna 404 si no existe."""
    response = auth_client.delete("/api/muestreo/solicitudes/99999")
    assert response.status_code == 404


def test_muestreo_requires_auth(client):
    """Los endpoints protegidos retornan 401 sin token JWT."""
    response = client.get("/api/muestreo/solicitudes")
    assert response.status_code == 401
