"""Equipment router – CRUD, state changes, calibrations."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_equipment_service
from src.backend.api.schemas.dim import (
    EquipoInstrumentoCreate, EquipoInstrumentoUpdate, EquipoInstrumentoResponse,
    EquipoDetalleResponse,
    CambioEstadoEquipoRequest,
    ZonaEquipoCreate, ZonaEquipoUpdate, ZonaEquipoResponse,
    CalibracionCreate, CalibracionResponse,
)
from src.backend.repositories.dim import (
    EquipoInstrumentoRepository, ZonaEquipoRepository,
    CalibracionCalificacionEquipoRepository,
)
from src.backend.services.equipment_service import EquipmentService
from src.backend.api.security import get_current_user, require_role
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])

# Roles con permiso de escritura sobre equipos
_ESCRITURA = ["administrador", "supervisor"]


# ─── Equipos ──────────────────────────────────────────────────

@router.post("/", response_model=EquipoInstrumentoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_equipo(
    body: EquipoInstrumentoCreate,
    db: Session = Depends(get_db),
    service: EquipmentService = Depends(get_equipment_service),
    current_user: Usuario = Depends(get_current_user),
):
    return service.create_equipo(db, body.model_dump(), usuario_id=current_user.usuario_id)


@router.get("/", response_model=List[EquipoDetalleResponse])
def list_equipos(
    skip: int = 0, 
    limit: int = 100, 
    area_id: Optional[int] = None,
    tipo_id: Optional[int] = None,
    estado_id: Optional[int] = None,
    db: Session = Depends(get_db),
    service: EquipmentService = Depends(get_equipment_service)
):
    equipos = service.get_equipment_with_details(db, skip, limit, area_id, tipo_id, estado_id)
    return [EquipoDetalleResponse.from_orm_extended(e) for e in equipos]


@router.get("/{equipo_id}", response_model=EquipoDetalleResponse)
def get_equipo(equipo_id: int, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    repo = EquipoInstrumentoRepository()
    equipo = repo.get(db, equipo_id, options=[
        joinedload(repo.model.tipo_equipo),
        joinedload(repo.model.estado),
        joinedload(repo.model.area)
    ])
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return EquipoDetalleResponse.from_orm_extended(equipo)


@router.put("/{equipo_id}", response_model=EquipoInstrumentoResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_equipo(equipo_id: int, body: EquipoInstrumentoUpdate, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    obj = repo.get(db, equipo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_equipo(equipo_id: int, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    obj = repo.get(db, equipo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    repo.delete(db, obj)
    return None


@router.post("/{equipo_id}/estado", response_model=EquipoInstrumentoResponse,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def change_equipo_state(
    equipo_id: int,
    body: CambioEstadoEquipoRequest,
    db: Session = Depends(get_db),
    service: EquipmentService = Depends(get_equipment_service),
    current_user: Usuario = Depends(get_current_user),
):
    try:
        uid = body.usuario_id or current_user.usuario_id
        return service.change_equipment_state(db, equipo_id, body.nuevo_estado_id, uid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─── Zonas ────────────────────────────────────────────────────

@router.post("/zonas", response_model=ZonaEquipoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_zona(body: ZonaEquipoCreate, db: Session = Depends(get_db)):
    repo = ZonaEquipoRepository()
    return repo.create(db, body.model_dump())


# ─── Calibraciones ───────────────────────────────────────────

@router.post("/calibraciones", response_model=CalibracionResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_calibracion(body: CalibracionCreate, db: Session = Depends(get_db)):
    repo = CalibracionCalificacionEquipoRepository()
    return repo.create(db, body.model_dump())


@router.get("/{equipo_id}/calibraciones", response_model=List[CalibracionResponse])
def list_calibraciones(equipo_id: int, db: Session = Depends(get_db)):
    repo = CalibracionCalificacionEquipoRepository()
    all_cals = repo.get_all(db, limit=1000)
    return [c for c in all_cals if c.equipo_instrumento_id == equipo_id]
