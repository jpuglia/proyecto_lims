"""Analysis router – analyses, incubations, results."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_analysis_service
from src.backend.api.schemas.fact import (
    AnalisisCreate, AnalisisResponse, AnalisisUpdate,
    CambioEstadoAnalisisRequest,
    IncubacionCreate, IncubacionResponse,
    ResultadoCreate, ResultadoResponse,
    UsoMediosCreate, UsoCepaCreate, ReporteConsolidadoResponse
)
from src.backend.repositories.fact import AnalisisRepository
from src.backend.services.analysis_service import AnalysisService
from src.backend.api.security import get_current_user, require_role
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])

_OPERATIVOS = ["administrador", "supervisor", "analista", "operador"]
_ESCRITURA  = ["administrador", "supervisor"]


# ─── Análisis ────────────────────────────────────────────────

@router.post("/", response_model=AnalisisResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_analisis(
    body: AnalisisCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
    current_user: Usuario = Depends(get_current_user),
):
    return service.create_analisis(db, body.model_dump(), body.operario_id)


@router.get("/", response_model=List[AnalisisResponse])
def list_analisis(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = AnalisisRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/{analisis_id}", response_model=AnalisisResponse)
def get_analisis(analisis_id: int, db: Session = Depends(get_db)):
    repo = AnalisisRepository()
    analisis = repo.get(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return analisis


@router.put("/{analisis_id}", response_model=AnalisisResponse,
            dependencies=[Depends(require_role(*_OPERATIVOS))])
def update_analisis(
    analisis_id: int,
    body: AnalisisUpdate,
    db: Session = Depends(get_db),
):
    repo = AnalisisRepository()
    analisis = repo.get(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return repo.update(db, analisis, body.model_dump(exclude_unset=True))


@router.post("/{analisis_id}/estado", response_model=AnalisisResponse,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def change_analisis_state(
    analisis_id: int,
    body: CambioEstadoAnalisisRequest,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    try:
        return service.change_analysis_state(db, analisis_id, body.nuevo_estado_id, body.operario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{analisis_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role(*_ESCRITURA))])
def delete_analisis(analisis_id: int, db: Session = Depends(get_db)):
    repo = AnalisisRepository()
    analisis = repo.get(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    repo.delete(db, analisis_id)
    return None


# ─── Incubaciones ────────────────────────────────────────────

@router.post("/incubaciones", response_model=IncubacionResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def create_incubacion(
    body: IncubacionCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.start_incubation(db, body.model_dump())


# ─── Resultados ──────────────────────────────────────────────

@router.post("/resultados", response_model=ResultadoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def register_resultado(
    body: ResultadoCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.register_resultado(db, body.model_dump())


# ─── Recursos ────────────────────────────────────────────────

@router.post("/uso-medios", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def register_uso_medios(
    body: UsoMediosCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.register_usage_media(db, body.model_dump())


@router.post("/uso-cepas", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_OPERATIVOS))])
def register_uso_cepas(
    body: UsoCepaCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.register_usage_strain(db, body.model_dump())


# ─── Reporte ─────────────────────────────────────────────────

@router.get("/report/{solicitud_id}", response_model=ReporteConsolidadoResponse)
def get_report(
    solicitud_id: int,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    report = service.get_analysis_report(db, solicitud_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado para esta solicitud")
    return report
