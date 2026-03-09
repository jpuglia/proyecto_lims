"""Manufacturing router – orders, processes, state transitions and traceability."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_manufacturing_service
from src.backend.api.schemas.fact import (
    OrdenManufacturaCreate, OrdenManufacturaResponse, OrdenManufacturaUpdate,
    OrdenManufacturaDetalleResponse,
    ManufacturaCreate, ManufacturaResponse, ManufacturaDetalleResponse, ManufacturaUpdate,
    CambioEstadoManufacturaRequest,
    EstadoManufacturaResponse, HistoricoEstadoManufacturaResponse,
    ManufacturaOperarioCreate, ManufacturaOperarioResponse, ManufacturaOperarioDetalleResponse,
    UsoMaterialManufacturaCreate, UsoMaterialManufacturaResponse, UsoMaterialManufacturaDetalleResponse,
)
from src.backend.repositories.fact import (
    OrdenManufacturaRepository, ManufacturaRepository, EstadoManufacturaRepository,
)
from src.backend.services.manufacturing_service import ManufacturingService
from src.backend.api.security import get_current_user, require_role
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])

_OPERATIVOS = ["administrador", "supervisor", "analista", "operador"]
_ESCRITURA  = ["administrador", "supervisor"]


# ─── Estados de Manufactura (catálogo) ───────────────────────────────────────

@router.get("/estados", response_model=List[EstadoManufacturaResponse])
def list_estados(db: Session = Depends(get_db)):
    """Lista todos los estados de manufactura disponibles (para selects del frontend)."""
    repo = EstadoManufacturaRepository()
    return repo.get_all(db, skip=0, limit=100)


# ─── Órdenes ─────────────────────────────────────────────────────────────────

@router.post("/ordenes", response_model=OrdenManufacturaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_orden(body: OrdenManufacturaCreate, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    return repo.create(db, body.model_dump())


@router.get("/ordenes", response_model=List[OrdenManufacturaResponse])
def list_ordenes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/ordenes/{orden_id}", response_model=OrdenManufacturaDetalleResponse)
def get_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service)
):
    obj = service.get_orden_trazabilidad(db, orden_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Map to detailed schema
    res = OrdenManufacturaDetalleResponse.model_validate(obj)
    res.procesos = [ManufacturaDetalleResponse.from_orm_extended(p) for p in obj.manufacturas]
    return res


@router.get("/ordenes/{orden_id}/procesos", response_model=List[ManufacturaDetalleResponse])
def get_procesos_by_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Retorna todos los procesos de manufactura de una orden (trazabilidad)."""
    # Verify order exists
    orden_repo = OrdenManufacturaRepository()
    if not orden_repo.get(db, orden_id):
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    procesos = service.get_procesos_by_orden(db, orden_id)
    return [ManufacturaDetalleResponse.from_orm_extended(p) for p in procesos]


@router.put("/ordenes/{orden_id}", response_model=OrdenManufacturaResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_orden(orden_id: int, body: OrdenManufacturaUpdate, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    obj = repo.get(db, orden_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/ordenes/{orden_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_orden(orden_id: int, db: Session = Depends(get_db)):
    repo = OrdenManufacturaRepository()
    obj = repo.get(db, orden_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    repo.delete(db, obj)
    return None


# ─── Procesos de Manufactura ──────────────────────────────────────────────────

@router.post("/procesos", response_model=ManufacturaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_manufactura(
    body: ManufacturaCreate,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
    current_user: Usuario = Depends(get_current_user),
):
    return service.create_manufacture_process(db, body.model_dump(), current_user.usuario_id)


@router.get("/procesos", response_model=List[ManufacturaDetalleResponse])
def list_manufacturas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista procesos enriquecidos con nombre del estado."""
    from sqlalchemy.orm import joinedload
    from src.backend.models.fact import Manufactura
    procesos = (
        db.query(Manufactura)
        .options(joinedload(Manufactura.estado))
        .offset(skip).limit(limit).all()
    )
    return [ManufacturaDetalleResponse.from_orm_extended(p) for p in procesos]


@router.get("/procesos/{manufactura_id}/historial", response_model=List[HistoricoEstadoManufacturaResponse])
def get_historial_proceso(
    manufactura_id: int,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Retorna el historial de cambios de estado de un proceso."""
    historico = service.get_historial_proceso(db, manufactura_id)
    result = []
    for h in historico:
        item = HistoricoEstadoManufacturaResponse.model_validate(h)
        if h.estado_manufactura:
            item.estado_nombre = h.estado_manufactura.nombre
        result.append(item)
    return result


@router.post("/procesos/{manufactura_id}/estado", response_model=ManufacturaResponse,
             dependencies=[Depends(require_role(*_ESCRITURA))])
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


# ─── Operarios de Manufactura ────────────────────────────────────────────────

@router.post("/procesos/{manufactura_id}/operarios", response_model=ManufacturaOperarioResponse,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def assign_operator(
    manufactura_id: int,
    body: ManufacturaOperarioCreate,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Asigna un operario a un proceso de manufactura."""
    if body.manufactura_id != manufactura_id:
        raise HTTPException(status_code=400, detail="ID de manufactura no coincide")
    return service.assign_operator_to_process(db, body.model_dump())


@router.get("/procesos/{manufactura_id}/operarios", response_model=List[ManufacturaOperarioDetalleResponse])
def list_operators(
    manufactura_id: int,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Lista los operarios asignados a un proceso específico."""
    operarios = service.get_operators_by_process(db, manufactura_id)
    return [ManufacturaOperarioDetalleResponse.from_orm_extended(o) for o in operarios]


# ─── Materiales de Manufactura ──────────────────────────────────────────────

@router.post("/procesos/{manufactura_id}/materiales", response_model=UsoMaterialManufacturaResponse,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def register_material(
    manufactura_id: int,
    body: UsoMaterialManufacturaCreate,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Registra el uso de un material en un proceso de manufactura."""
    if body.manufactura_id != manufactura_id:
        raise HTTPException(status_code=400, detail="ID de manufactura no coincide")
    return service.register_material_usage(db, body.model_dump())


@router.get("/procesos/{manufactura_id}/materiales", response_model=List[UsoMaterialManufacturaDetalleResponse])
def list_materials(
    manufactura_id: int,
    db: Session = Depends(get_db),
    service: ManufacturingService = Depends(get_manufacturing_service),
):
    """Lista los materiales utilizados en un proceso específico."""
    materiales = service.get_materials_by_process(db, manufactura_id)
    return [UsoMaterialManufacturaDetalleResponse.from_orm_extended(m) for m in materiales]

