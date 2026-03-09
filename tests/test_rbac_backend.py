import pytest
from fastapi import status

def test_operador_cannot_create_planta(operador_client):
    payload = {
        "codigo": "PLT-FORBIDDEN",
        "nombre": "Planta No Permitida",
        "sistema_id": 1
    }
    response = operador_client.post("/api/ubicaciones/plantas", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_operador_cannot_delete_planta(operador_client):
    # Even if the ID doesn't exist, it should check roles first
    response = operador_client.delete("/api/ubicaciones/plantas/1")
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_operador_cannot_create_equipo(operador_client):
    payload = {
        "codigo": "EQ-FORBIDDEN",
        "nombre": "Equipo No Permitido",
        "tipo_equipo_id": 1,
        "planta_id": 1,
        "area_id": 1,
        "estado_id": 1
    }
    response = operador_client.post("/api/equipos/", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_supervisor_can_create_planta(supervisor_client):
    # This might fail due to FK if we don't seed Sistema, 
    # but the status should NOT be 403. 
    payload = {
        "codigo": "PLT-SUP",
        "nombre": "Planta Supervisor",
        "sistema_id": 1
    }
    response = supervisor_client.post("/api/ubicaciones/plantas", json=payload)
    assert response.status_code != status.HTTP_403_FORBIDDEN

def test_operador_can_list_plantas(operador_client):
    response = operador_client.get("/api/ubicaciones/plantas")
    assert response.status_code == status.HTTP_200_OK

def test_operador_can_create_solicitud_muestreo(operador_client):
    # Operators SHOULD be able to create transaction data
    payload = {
        "usuario_id": 1,
        "tipo": "Ambiental",
        "estado_solicitud_id": 1,
        "observacion": "Muestreo por operador"
    }
    response = operador_client.post("/api/muestreo/solicitudes", json=payload)
    assert response.status_code != status.HTTP_403_FORBIDDEN

def test_operador_cannot_create_producto(operador_client):
    # Products are Master Data
    payload = {
        "codigo": "PRD-FORBIDDEN",
        "nombre": "Producto No Permitido",
        "descripcion": "Test"
    }
    response = operador_client.post("/api/productos", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_supervisor_can_create_producto(supervisor_client):
    payload = {
        "codigo": "PRD-SUP",
        "nombre": "Producto Supervisor",
        "descripcion": "Test"
    }
    response = supervisor_client.post("/api/productos", json=payload)
    assert response.status_code != status.HTTP_403_FORBIDDEN

def test_operador_cannot_delete_producto(operador_client):
    response = operador_client.delete("/api/productos/1")
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_supervisor_cannot_delete_producto(supervisor_client):
    # Delete usually requires admin
    response = supervisor_client.delete("/api/productos/1")
    assert response.status_code == status.HTTP_403_FORBIDDEN
