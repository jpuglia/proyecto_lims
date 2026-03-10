import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.backend.api.app import app
from src.backend.api.dependencies import get_db
from src.backend.api.security import get_current_user
from src.backend.models.auth import Usuario
from tests.conftest import _create_test_user_with_role

@pytest.fixture
def inspector_client(db_session: Session):
    test_user = _create_test_user_with_role(db_session, "inspector")
    
    def override_get_db():
        yield db_session
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: test_user
    
    with TestClient(app) as client:
        client.inspector_id = test_user.usuario_id
        yield client
        
    app.dependency_overrides.clear()

def test_create_sampling_valid_destination(inspector_client: TestClient, seed_data):
    # Test with valid enum value
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "sampling_point_id": 1,
        "destination": "Retén"
    }
    
    from src.backend.models.dim import PuntoMuestreo
    db = next(app.dependency_overrides[get_db]())
    if not db.query(PuntoMuestreo).filter_by(punto_muestreo_id=1).first():
        db.add(PuntoMuestreo(punto_muestreo_id=1, codigo="PM-01", nombre="Punto 01", area_id=1))
        db.commit()

    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    assert response.json()["destination"] == "Retén"

def test_create_sampling_invalid_destination(inspector_client: TestClient):
    # Test with invalid enum value (should return 400 because of custom exception handler)
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "sampling_point_id": 1,
        "destination": "Destino Inventado"
    }
    
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 400 # Custom handler converts 422 to 400
    assert "Input should be 'Microbiología', 'Fisicoquímico' or 'Retén'" in response.json()["message"]

def test_create_sampling_product_success(inspector_client: TestClient, seed_data):
    # Test Product Sampling (Product + Quantity)
    from src.backend.models.master import Producto
    from src.backend.models.fact import OrdenManufactura
    db = next(app.dependency_overrides[get_db]())
    
    # Seed product and order
    if not db.query(Producto).filter_by(producto_id=1).first():
        db.add(Producto(producto_id=1, codigo="P01", nombre="Prod 01", planta_id=1))
    if not db.query(OrdenManufactura).filter_by(orden_manufactura_id=1).first():
        db.add(OrdenManufactura(orden_manufactura_id=1, codigo="OM01", lote="L01", fecha=datetime.now().date(), producto_id=1, cantidad=100, unidad="un", operario_id=1))
    db.commit()

    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "product_id": 1,
        "lot_id": 1,
        "extracted_quantity": 500.50,
        "destination": "Fisicoquímico"
    }
    
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert float(data["extracted_quantity"]) == 500.50

def test_create_sampling_product_validation_error(inspector_client: TestClient):
    # Test Validation Error (Product without Quantity)
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "product_id": 1,
        "destination": "Microbiología" # Valid enum
    }
    
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 400
    assert "extracted_quantity es requerido" in response.json()["message"]

def test_create_sampling_date_validation_error(inspector_client: TestClient):
    # Test Validation Error (End < Start)
    start = datetime.now()
    end = start - timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "sampling_point_id": 1,
        "destination": "Retén" # Valid enum
    }
    
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 400
    assert "end_datetime debe ser estrictamente mayor" in response.json()["message"]

def test_create_sampling_unauthorized(db_session: Session):
    # Test that a user without inspector role cannot create sampling
    from tests.conftest import _create_test_user_with_role
    test_user = _create_test_user_with_role(db_session, "operador") # Operador doesn't have access
    
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as client:
        payload = {
            "inspector_id": test_user.usuario_id,
            "start_datetime": datetime.now().isoformat(),
            "end_datetime": (datetime.now() + timedelta(hours=1)).isoformat(),
            "sampling_point_id": 1,
            "destination": "Microbiología" # Valid enum
        }
        response = client.post("/api/inspection/samplings/", json=payload)
        # require_role raises HTTPException(403)
        assert response.status_code == 403
    app.dependency_overrides.clear()

def test_create_sampling_with_lot_number_manual(inspector_client: TestClient, seed_data):
    # Test manual lot_number (string) persistence
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "product_id": 1,
        "lot_number": "LOTE-MANUAL-001",
        "extracted_quantity": 100.00,
        "destination": "Microbiología"
    }
    
    # Ensure product 1 exists
    from src.backend.models.master import Producto
    db = next(app.dependency_overrides[get_db]())
    if not db.query(Producto).filter_by(producto_id=1).first():
        db.add(Producto(producto_id=1, codigo="P01", nombre="Prod 01", planta_id=1))
        db.commit()

    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    assert response.json()["lot_number"] == "LOTE-MANUAL-001"

def test_sampling_persistence_with_request(inspector_client: TestClient, db_session: Session):
    # Verify request_id is persisted correctly
    from src.backend.models.fact import SolicitudMuestreo
    from src.backend.models.dim import PuntoMuestreo
    
    if not db_session.query(PuntoMuestreo).filter_by(punto_muestreo_id=1).first():
        db_session.add(PuntoMuestreo(punto_muestreo_id=1, codigo="PM-01", nombre="Punto 01", area_id=1))
    
    solicitud = SolicitudMuestreo(solicitud_muestreo_id=99, tipo="Ambiental", fecha=datetime.now(), usuario_id=1, estado_solicitud_id=1)
    db_session.add(solicitud)
    db_session.commit()
    
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "request_id": 99,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "sampling_point_id": 1,
        "destination": "Microbiología" # Valid enum
    }
    
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    assert response.json()["request_id"] == 99

def test_review_batch_success(inspector_client: TestClient, db_session: Session):
    # Setup: 2 samplings with same batch_id
    from src.backend.models.inspection import Sampling
    import uuid
    
    batch_id = str(uuid.uuid4())
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    s1 = Sampling(
        batch_id=batch_id, inspector_id=1, start_datetime=start, end_datetime=end,
        destination="Microbiología", status="PENDING_REVIEW", sample_type="Agua"
    )
    s2 = Sampling(
        batch_id=batch_id, inspector_id=1, start_datetime=start, end_datetime=end,
        destination="Microbiología", status="PENDING_REVIEW", sample_type="Agua"
    )
    db_session.add(s1)
    db_session.add(s2)
    db_session.commit()
    
    response = inspector_client.patch(f"/api/inspection/samplings/batch/{batch_id}/review")
    assert response.status_code == 200
    assert response.json()["count"] == 2
    
    # Verify persistence
    db_session.refresh(s1)
    db_session.refresh(s2)
    assert s1.status == "PENDING_SUBMISSION"
    assert s2.status == "PENDING_SUBMISSION"
    assert s1.reviewer_id == inspector_client.inspector_id

def test_create_personnel_swab_operario_success(inspector_client: TestClient, seed_data):
    from src.backend.models.master import Producto
    db = next(app.dependency_overrides[get_db]())
    if not db.query(Producto).filter_by(producto_id=1).first():
        db.add(Producto(producto_id=1, codigo="P01", nombre="Prod 01", planta_id=1))
    db.commit()

    start = datetime.now()
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": (start + timedelta(hours=1)).isoformat(),
        "sample_type": "Hisopado",
        "operario_muestreado_id": 1,
        "area_id": 1,
        "product_id": 1,
        "region_swabbed": "Guante Derecho",
        "destination": "Microbiología"
    }
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    assert response.json()["area_id"] == 1
    assert response.json()["product_id"] == 1

def test_create_personnel_swab_operario_missing_area(inspector_client: TestClient):
    start = datetime.now()
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": (start + timedelta(hours=1)).isoformat(),
        "sample_type": "Hisopado",
        "operario_muestreado_id": 1,
        # area_id is missing
        "product_id": 1,
        "region_swabbed": "Guante Derecho",
        "destination": "Microbiología"
    }
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 400
    assert "especificar el Área" in response.json()["message"]

def test_create_personnel_swab_tyvek_success(inspector_client: TestClient):
    start = datetime.now()
    payload = {
        "inspector_id": inspector_client.inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": (start + timedelta(hours=1)).isoformat(),
        "sample_type": "Hisopado",
        "operario_muestreado_id": 99, # Special Tyvek ID
        "tyvek_wash_number": 4,
        "region_swabbed": "Manga",
        "destination": "Microbiología"
    }
    response = inspector_client.post("/api/inspection/samplings/", json=payload)
    assert response.status_code == 201
    assert response.json()["tyvek_wash_number"] == 4
