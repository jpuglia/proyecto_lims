"""Equipment router – CRUD, state changes, calibrations."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_equipment_service
from src.backend.api.schemas.dim import (
    EquipoInstrumentoCreate, EquipoInstrumentoUpdate, EquipoInstrumentoResponse,
    CambioEstadoEquipoRequest,
    ZonaEquipoCreate, ZonaEquipoUpdate, ZonaEquipoResponse,
    CalibracionCreate, CalibracionResponse,
)
from src.backend.repositories.dim import (
    EquipoInstrumentoRepository, ZonaEquipoRepository,
    CalibracionCalificacionEquipoRepository,
)
from src.backend.services.equipment_service import EquipmentService
from src.backend.api.security import get_current_user
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])


# ─── Equipos ──────────────────────────────────────────────────

@router.post("/", response_model=EquipoInstrumentoResponse, status_code=status.HTTP_201_CREATED)
def create_equipo(
    body: EquipoInstrumentoCreate,
    db: Session = Depends(get_db),
    service: EquipmentService = Depends(get_equipment_service),
):
    return service.create_equipo(db, body.model_dump())


@router.get("/", response_model=List[EquipoInstrumentoResponse])
def list_equipos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/{equipo_id}", response_model=EquipoInstrumentoResponse)
def get_equipo(equipo_id: int, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    equipo = repo.get(db, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo


@router.put("/{equipo_id}", response_model=EquipoInstrumentoResponse)
def update_equipo(equipo_id: int, body: EquipoInstrumentoUpdate, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    obj = repo.get(db, equipo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipo(equipo_id: int, db: Session = Depends(get_db)):
    repo = EquipoInstrumentoRepository()
    obj = repo.get(db, equipo_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    repo.delete(db, obj)
    return None


@router.post("/{equipo_id}/estado", response_model=EquipoInstrumentoResponse)
def change_equipo_state(
    equipo_id: int,
    body: CambioEstadoEquipoRequest,
    db: Session = Depends(get_db),
    service: EquipmentService = Depends(get_equipment_service),
    current_user: Usuario = Depends(get_current_user), # Use authenticated user
):
    try:
        # Use body.usuario_id if provided, else current_user
        uid = body.usuario_id or current_user.usuario_id
        return service.change_equipment_state(db, equipo_id, body.nuevo_estado_id, uid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─── Zonas ────────────────────────────────────────────────────

@router.post("/zonas", response_model=ZonaEquipoResponse, status_code=status.HTTP_201_CREATED)
def create_zona(body: ZonaEquipoCreate, db: Session = Depends(get_db)):
    repo = ZonaEquipoRepository()
    return repo.create(db, body.model_dump())


# ─── Calibraciones ───────────────────────────────────────────

@router.post("/calibraciones", response_model=CalibracionResponse, status_code=status.HTTP_201_CREATED)
def create_calibracion(body: CalibracionCreate, db: Session = Depends(get_db)):
    repo = CalibracionCalificacionEquipoRepository()
    return repo.create(db, body.model_dump())


@router.get("/{equipo_id}/calibraciones", response_model=List[CalibracionResponse])
def list_calibraciones(equipo_id: int, db: Session = Depends(get_db)):
    repo = CalibracionCalificacionEquipoRepository()
    all_cals = repo.get_all(db, limit=1000)
    return [c for c in all_cals if c.equipo_instrumento_id == equipo_id]
