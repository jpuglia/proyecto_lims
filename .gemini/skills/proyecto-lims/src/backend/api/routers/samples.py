"""Samples router – requests, sampling sessions, shipments, reception."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_sample_service
from src.backend.api.schemas.fact import (
    SolicitudMuestreoCreate, SolicitudMuestreoResponse, SolicitudMuestreoUpdate,
    MuestreoConMuestrasCreate, MuestreoResponse,
    EnvioMuestraCreate, EnvioMuestraResponse, EnvioMuestraUpdate,
    RecepcionCreate, RecepcionResponse, RecepcionUpdate,
)
from src.backend.repositories.fact import SolicitudMuestreoRepository, EnvioMuestraRepository, RecepcionRepository
from src.backend.services.sample_service import SampleService
from src.backend.api.security import get_current_user, require_role
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])

# Operadores y analistas pueden crear muestras; supervisores y admins pueden eliminar
_OPERATIVOS = ["administrador", "supervisor", "analista", "operador"]
_ESCRITURA = ["administrador", "supervisor"]


# ─── Solicitudes ──────────────────────────────────────────────

@router.post("/solicitudes", response_model=SolicitudMuestreoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_solicitud(
    body: SolicitudMuestreoCreate,
    db: Session = Depends(get_db),
    service: SampleService = Depends(get_sample_service),
):
    return service.create_sampling_request(db, body.model_dump(), body.usuario_id)


@router.get("/solicitudes", response_model=List[SolicitudMuestreoResponse])
def list_solicitudes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = SolicitudMuestreoRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.put("/solicitudes/{solicitud_id}", response_model=SolicitudMuestreoResponse,
            dependencies=[Depends(require_role(*_OPERATIVOS))])
def update_solicitud(
    solicitud_id: int,
    body: SolicitudMuestreoUpdate,
    db: Session = Depends(get_db),
):
    repo = SolicitudMuestreoRepository()
    obj = repo.get(db, solicitud_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))


@router.delete("/solicitudes/{solicitud_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(*_ESCRITURA))])
def delete_solicitud(solicitud_id: int, db: Session = Depends(get_db)):
    repo = SolicitudMuestreoRepository()
    obj = repo.get(db, solicitud_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    repo.delete(db, solicitud_id)
    return None


# ─── Sesiones de Muestreo ────────────────────────────────────

@router.post("/sesiones", response_model=MuestreoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_muestreo(
    body: MuestreoConMuestrasCreate,
    db: Session = Depends(get_db),
    service: SampleService = Depends(get_sample_service),
):
    muestras_data = [m.model_dump() for m in body.muestras]
    return service.register_sampling_session(db, body.session.model_dump(), muestras_data)


# ─── Envíos ──────────────────────────────────────────────────

@router.post("/envios", response_model=EnvioMuestraResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_envio(body: EnvioMuestraCreate, db: Session = Depends(get_db)):
    from src.backend.repositories.fact import EnvioMuestraRepository
    repo = EnvioMuestraRepository()
    return repo.create(db, body.model_dump())


# ─── Recepción ───────────────────────────────────────────────

@router.post("/recepciones", response_model=RecepcionResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_recepcion(
    body: RecepcionCreate,
    db: Session = Depends(get_db),
    service: SampleService = Depends(get_sample_service),
):
    return service.receive_sample(db, body.model_dump())
