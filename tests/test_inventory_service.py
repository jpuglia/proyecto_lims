import pytest
from datetime import date
from src.backend.services.inventory_service import InventoryService
from src.backend.repositories.inventory import (
    RecepcionPolvoSuplementoRepository, StockPolvoSuplementoRepository,
    UsoPolvoSuplementoRepository, OrdenPreparacionMedioRepository,
    StockMediosRepository, AprobacionMediosRepository, EstadoQCRepository
)

def test_prepare_media_insufficient_stock(db_session):
    # Setup repositories
    recepcion_repo = RecepcionPolvoSuplementoRepository()
    stock_repo = StockPolvoSuplementoRepository()
    uso_repo = UsoPolvoSuplementoRepository()
    orden_repo = OrdenPreparacionMedioRepository()
    stock_medios_repo = StockMediosRepository()
    aprob_repo = AprobacionMediosRepository()
    qc_repo = EstadoQCRepository()
    
    service = InventoryService(
        recepcion_repo, stock_repo, uso_repo, orden_repo,
        stock_medios_repo, aprob_repo, qc_repo
    )
    
    # Create initial stock (10 units)
    recepcion = service.register_powder_reception(db_session, {
        "polvo_suplemento_id": 1, # Assume ID 1 exists
        "lote_proveedor": "LOTE-001",
        "vence": date(2030, 1, 1),
        "cantidad": 10.0
    })
    
    # Try to prepare media consuming 15 units (more than available)
    orden_data = {
        "medio_preparado_id": 1,
        "lote": "LOTE-INT-001",
        "volumen_total": 100.0,
        "unidad_volumen": "mL",
        "operario_id": 1
    }
    consumos = [{
        "stock_polvo_suplemento_id": 1, # Correct ID from previous step
        "cantidad": 15.0,
        "unidad": "g"
    }]
    
    with pytest.raises(ValueError) as excinfo:
        service.prepare_culture_media(db_session, orden_data, consumos)
    
    assert "Not enough stock available" in str(excinfo.value)
