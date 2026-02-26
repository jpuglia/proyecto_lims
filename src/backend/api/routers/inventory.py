"""Inventory router – powders, media preparation, stock, approvals."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_inventory_service
from src.backend.api.schemas.inventory import (
    PolvoSuplementoCreate, PolvoSuplementoResponse, PolvoSuplementoUpdate,
    RecepcionPolvoCreate, RecepcionPolvoResponse, RecepcionPolvoUpdate,
    MedioPreparadoCreate, MedioPreparadoResponse, MedioPreparadoUpdate,
    OrdenPreparacionCreate, OrdenPreparacionResponse,
    StockMediosResponse,
    AprobacionMediosCreate, AprobacionMediosResponse, AprobacionMediosUpdate,
)
from src.backend.repositories.inventory import (
    PolvoSuplementoRepository, RecepcionPolvoSuplementoRepository,
    MedioPreparadoRepository, StockMediosRepository, AprobacionMediosRepository,
)
from src.backend.services.inventory_service import InventoryService
from src.backend.api.security import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


# ─── Polvos / Suplementos ────────────────────────────────────

@router.post("/polvos", response_model=PolvoSuplementoResponse, status_code=status.HTTP_201_CREATED)
def create_polvo(body: PolvoSuplementoCreate, db: Session = Depends(get_db)):
    repo = PolvoSuplementoRepository()
    return repo.create(db, body.model_dump())


@router.get("/polvos", response_model=List[PolvoSuplementoResponse])
def list_polvos(db: Session = Depends(get_db)):
    repo = PolvoSuplementoRepository()
    return repo.get_all(db)


@router.put("/polvos/{polvo_id}", response_model=PolvoSuplementoResponse)
def update_polvo(polvo_id: int, body: PolvoSuplementoUpdate, db: Session = Depends(get_db)):
    repo = PolvoSuplementoRepository()
    obj = repo.get(db, polvo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Polvo/Suplemento no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/polvos/{polvo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_polvo(polvo_id: int, db: Session = Depends(get_db)):
    repo = PolvoSuplementoRepository()
    obj = repo.get(db, polvo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Polvo/Suplemento no encontrado")
    repo.delete(db, obj)
    return None


# ─── Recepción de Polvos ─────────────────────────────────────

@router.post("/polvos/recepciones", response_model=RecepcionPolvoResponse, status_code=status.HTTP_201_CREATED)
def receive_polvo(
    body: RecepcionPolvoCreate,
    db: Session = Depends(get_db),
    service: InventoryService = Depends(get_inventory_service),
):
    return service.register_powder_reception(db, body.model_dump())


@router.put("/polvos/recepciones/{recep_id}", response_model=RecepcionPolvoResponse)
def update_recepcion_polvo(recep_id: int, body: RecepcionPolvoUpdate, db: Session = Depends(get_db)):
    repo = RecepcionPolvoSuplementoRepository()
    obj = repo.get(db, recep_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Recepción no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


# ─── Medios Preparados ───────────────────────────────────────

@router.post("/medios", response_model=MedioPreparadoResponse, status_code=status.HTTP_201_CREATED)
def create_medio(body: MedioPreparadoCreate, db: Session = Depends(get_db)):
    repo = MedioPreparadoRepository()
    return repo.create(db, body.model_dump())


@router.get("/medios", response_model=List[MedioPreparadoResponse])
def list_medios(db: Session = Depends(get_db)):
    repo = MedioPreparadoRepository()
    return repo.get_all(db)


@router.put("/medios/{medio_id}", response_model=MedioPreparadoResponse)
def update_medio(medio_id: int, body: MedioPreparadoUpdate, db: Session = Depends(get_db)):
    repo = MedioPreparadoRepository()
    obj = repo.get(db, medio_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medio preparado no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


# ─── Preparación de Medios ───────────────────────────────────

@router.post("/medios/preparacion", response_model=OrdenPreparacionResponse, status_code=status.HTTP_201_CREATED)
def prepare_media(
    body: OrdenPreparacionCreate,
    db: Session = Depends(get_db),
    service: InventoryService = Depends(get_inventory_service),
):
    try:
        consumos = [c.model_dump() for c in body.consumos]
        return service.prepare_culture_media(db, body.orden.model_dump(), consumos)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── Stock de Medios ──────────────────────────────────────────

@router.get("/stock", response_model=List[StockMediosResponse])
def list_stock(db: Session = Depends(get_db)):
    repo = StockMediosRepository()
    return repo.get_all(db)


# ─── Aprobaciones ────────────────────────────────────────────

@router.post("/aprobaciones", response_model=AprobacionMediosResponse, status_code=status.HTTP_201_CREATED)
def approve_media(body: AprobacionMediosCreate, db: Session = Depends(get_db)):
    repo = AprobacionMediosRepository()
    return repo.create(db, body.model_dump())


@router.put("/aprobaciones/{aprob_id}", response_model=AprobacionMediosResponse)
def update_aprobacion(aprob_id: int, body: AprobacionMediosUpdate, db: Session = Depends(get_db)):
    repo = AprobacionMediosRepository()
    obj = repo.get(db, aprob_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Aprobación no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))
