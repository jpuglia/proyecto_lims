"""Manufacturing router – orders & manufacture processes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_manufacturing_service
from src.backend.api.schemas.fact import (
    OrdenManufacturaCreate, OrdenManufacturaResponse, OrdenManufacturaUpdate,
    ManufacturaCreate, ManufacturaResponse, ManufacturaUpdate,
    CambioEstadoManufacturaRequest,
)
from src.backend.repositories.fact import OrdenManufacturaRepository, ManufacturaRepository
from src.backend.services.manufacturing_service import ManufacturingService
from src.backend.api.security import get_current_user
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])


# ─── Órdenes ──────────────────────────────────────────────────

@router.post("/ordenes", response_model=OrdenManufacturaResponse, status_code=status.HTTP_201_CREATED)
def create_orden(body: OrdenManufacturaCreate, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    return repo.create(db, body.model_dump())


@router.get("/ordenes", response_model=List[OrdenManufacturaResponse])
def list_ordenes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.put("/ordenes/{orden_id}", response_model=OrdenManufacturaResponse)
def update_orden(orden_id: int, body: OrdenManufacturaUpdate, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    obj = repo.get(db, orden_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/ordenes/{orden_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_orden(orden_id: int, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    obj = repo.get(db, orden_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    repo.delete(db, obj)
    return None


# ─── Manufactura ──────────────────────────────────────────────

@router.post("/procesos", response_model=ManufacturaResponse, status_code=status.HTTP_201_CREATED)
def create_manufactura(
    body: ManufacturaCreate,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
    current_user: Usuario = Depends(get_current_user),
):
    return service.create_manufacture_process(db, body.model_dump(), current_user.usuario_id)


@router.get("/procesos", response_model=List[ManufacturaResponse])
def list_manufacturas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = ManufacturaRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.post("/procesos/{manufactura_id}/estado", response_model=ManufacturaResponse)
def change_manufactura_state(
    manufactura_id: int,
    body: CambioEstadoManufacturaRequest,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    try:
        return service.change_manufacture_state(db, manufactura_id, body.nuevo_estado_id, body.usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
