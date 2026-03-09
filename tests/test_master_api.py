import pytest
from fastapi import status

def test_list_tipos_solicitud(auth_client, seed_data):
    """Verificar que se listan los tipos de solicitud (deben haber al menos 9 del seeder)"""
    response = auth_client.get("/api/master/tipos-solicitud")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 9
    
    # Verificar algunos de los esperados
    codigos = [item["codigo"] for item in data]
    assert "AIRE_AREA" in codigos
    assert "PRODUCTO" in codigos
    assert "AGUA" in codigos

def test_create_tipo_solicitud(auth_client, seed_data):
    """Verificar la creación de un nuevo tipo de solicitud"""
    payload = {
        "codigo": "TEST_TIPO",
        "descripcion": "Tipo de prueba",
        "categoria": "Test",
        "activo": True
    }
    response = auth_client.post("/api/master/tipos-solicitud", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["codigo"] == "TEST_TIPO"
    assert data["tipo_solicitud_id"] is not None

def test_update_tipo_solicitud(auth_client, seed_data):
    """Verificar la actualización de un tipo de solicitud"""
    # Primero creamos uno
    payload = {
        "codigo": "TIPO_UPDATE",
        "descripcion": "Original",
        "activo": True
    }
    res_create = auth_client.post("/api/master/tipos-solicitud", json=payload)
    tipo_id = res_create.json()["tipo_solicitud_id"]
    
    # Actualizamos
    update_payload = {"descripcion": "Modificado", "activo": False}
    response = auth_client.put(f"/api/master/tipos-solicitud/{tipo_id}", json=update_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["descripcion"] == "Modificado"
    assert data["activo"] is False

def test_get_catalogs_includes_tipos_solicitud(auth_client, seed_data):
    """Verificar que el catálogo consolidado incluye los tipos de solicitud"""
    response = auth_client.get("/api/master/catalogos")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "tipos_solicitud" in data
    assert len(data["tipos_solicitud"]) >= 9
