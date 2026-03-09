import pytest
from datetime import date, datetime
from sqlalchemy.orm import Session
from src.backend.models.fact import OrdenManufactura, Manufactura, UsoMaterialManufactura
from src.backend.models.inventory import StockPolvoSuplemento, RecepcionPolvoSuplemento, PolvoSuplemento
from src.backend.services.manufacturing_service import ManufacturingService
from src.backend.repositories.fact import (
    OrdenManufacturaRepository, ManufacturaRepository, 
    HistoricoEstadoManufacturaRepository, EstadoManufacturaRepository,
    ManufacturaOperarioRepository
)

@pytest.fixture
def manufacturing_service():
    return ManufacturingService(
        orden_repo=OrdenManufacturaRepository(),
        manufactura_repo=ManufacturaRepository(),
        historico_repo=HistoricoEstadoManufacturaRepository(),
        estado_repo=EstadoManufacturaRepository(),
        operario_repo=ManufacturaOperarioRepository()
    )

def test_register_material_usage(db_session: Session, manufacturing_service: ManufacturingService):
    # Setup: Create necessary entities
    polvo = PolvoSuplemento(nombre="Polvo Test", codigo="P001", unidad="kg")
    db_session.add(polvo)
    db_session.commit()

    recepcion = RecepcionPolvoSuplemento(
        polvo_suplemento_id=polvo.polvo_suplemento_id,
        lote_proveedor="L001",
        cantidad=100.0,
        vence=date(2030, 1, 1)
    )
    db_session.add(recepcion)
    db_session.commit()

    stock = StockPolvoSuplemento(
        recepcion_polvo_suplemento_id=recepcion.recepcion_polvo_suplemento_id,
        cantidad=100.0
    )
    db_session.add(stock)
    db_session.commit()

    orden = OrdenManufactura(
        codigo="OM-001", lote="L001", fecha=date.today(),
        producto_id=1, cantidad=50.0, unidad="kg", operario_id=1
    )
    db_session.add(orden)
    db_session.commit()

    manufactura = Manufactura(
        orden_manufactura_id=orden.orden_manufactura_id,
        estado_manufactura_id=1
    )
    db_session.add(manufactura)
    db_session.commit()

    # Act: Register material usage
    usage_data = {
        "manufactura_id": manufactura.manufactura_id,
        "stock_polvo_suplemento_id": stock.stock_polvo_suplemento_id,
        "cantidad": 10.5,
        "unidad": "kg"
    }
    uso = manufacturing_service.register_material_usage(db_session, usage_data)

    # Assert
    assert uso.uso_material_manufactura_id is not None
    assert uso.cantidad == 10.5
    assert uso.manufactura_id == manufactura.manufactura_id
    
    # Check retrieval
    materiales = manufacturing_service.get_materials_by_process(db_session, manufactura.manufactura_id)
    assert len(materiales) == 1
    assert materiales[0].cantidad == 10.5
    assert materiales[0].stock_polvo.stock_polvo_suplemento_id == stock.stock_polvo_suplemento_id
