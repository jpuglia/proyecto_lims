"""Analysis router – analyses, incubations, results."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_analysis_service
from src.backend.api.schemas.fact import (
    AnalisisCreate, AnalisisResponse, AnalisisUpdate,
    IncubacionCreate, IncubacionResponse,
    ResultadoCreate, ResultadoResponse,
)
from src.backend.repositories.fact import AnalisisRepository
from src.backend.services.analysis_service import AnalysisService
from src.backend.api.security import get_current_user
from src.backend.models.auth import Usuario

router = APIRouter(dependencies=[Depends(get_current_user)])


# ─── Análisis ────────────────────────────────────────────────

@router.post("/", response_model=AnalisisResponse, status_code=status.HTTP_201_CREATED)
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


@router.put("/{analisis_id}", response_model=AnalisisResponse)
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


@router.delete("/{analisis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analisis(analisis_id: int, db: Session = Depends(get_db)):
    repo = AnalisisRepository()
    analisis = repo.get(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    repo.delete(db, analisis_id)
    return None


# ─── Incubaciones ────────────────────────────────────────────

@router.post("/incubaciones", response_model=IncubacionResponse, status_code=status.HTTP_201_CREATED)
def create_incubacion(
    body: IncubacionCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.start_incubation(db, body.model_dump())


# ─── Resultados ──────────────────────────────────────────────

@router.post("/resultados", response_model=ResultadoResponse, status_code=status.HTTP_201_CREATED)
def register_resultado(
    body: ResultadoCreate,
    db: Session = Depends(get_db),
    service: AnalysisService = Depends(get_analysis_service),
):
    return service.register_resultado(db, body.model_dump())
