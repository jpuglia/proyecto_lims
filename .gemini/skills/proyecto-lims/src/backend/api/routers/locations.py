from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.api.schemas.dim import (
    SistemaCreate, SistemaUpdate, SistemaResponse,
    PlantaCreate, PlantaUpdate, PlantaResponse,
    AreaCreate, AreaUpdate, AreaResponse,
    PuntoMuestreoCreate, PuntoMuestreoUpdate, PuntoMuestreoResponse
)
from src.backend.repositories.dim import SistemaRepository, PlantaRepository, AreaRepository, PuntoMuestreoRepository
from src.backend.api.security import get_current_user, require_role

router = APIRouter(dependencies=[Depends(get_current_user)])

_ESCRITURA = ["administrador", "supervisor"]

# ─── Sistemas ──────────────────────────────────────────────────

@router.post("/sistemas", response_model=SistemaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_sistema(body: SistemaCreate, db: Session = Depends(get_db)):
    repo = SistemaRepository()
    return repo.create(db, body.model_dump())

@router.get("/sistemas", response_model=List[SistemaResponse])
def list_sistemas(skip: int = 0, limit: int = 100, only_active: bool = True, db: Session = Depends(get_db)):
    repo = SistemaRepository()
    return repo.get_all(db, skip=skip, limit=limit, only_active=only_active)

@router.get("/sistemas/{sistema_id}", response_model=SistemaResponse)
def get_sistema(sistema_id: int, db: Session = Depends(get_db)):
    repo = SistemaRepository()
    obj = repo.get(db, sistema_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sistema no encontrado")
    return obj

@router.put("/sistemas/{sistema_id}", response_model=SistemaResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_sistema(sistema_id: int, body: SistemaUpdate, db: Session = Depends(get_db)):
    repo = SistemaRepository()
    obj = repo.get(db, sistema_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sistema no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))

@router.delete("/sistemas/{sistema_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_sistema(sistema_id: int, db: Session = Depends(get_db)):
    repo = SistemaRepository()
    if not repo.delete(db, sistema_id):
        raise HTTPException(status_code=404, detail="Sistema no encontrado")
    return None


# ─── Plantas ──────────────────────────────────────────────────

@router.post("/plantas", response_model=PlantaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_planta(body: PlantaCreate, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    return repo.create(db, body.model_dump())

@router.get("/plantas", response_model=List[PlantaResponse])
def list_plantas(skip: int = 0, limit: int = 100, only_active: bool = True, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    return repo.get_all(db, skip=skip, limit=limit, only_active=only_active)

@router.get("/plantas/{planta_id}", response_model=PlantaResponse)
def get_planta(planta_id: int, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    obj = repo.get(db, planta_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Planta no encontrada")
    return obj

@router.put("/plantas/{planta_id}", response_model=PlantaResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_planta(planta_id: int, body: PlantaUpdate, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    obj = repo.get(db, planta_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Planta no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))

@router.delete("/plantas/{planta_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_planta(planta_id: int, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    if not repo.delete(db, planta_id):
        raise HTTPException(status_code=404, detail="Planta no encontrada")
    return None


# ─── Áreas ────────────────────────────────────────────────────

@router.post("/areas", response_model=AreaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_area(body: AreaCreate, db: Session = Depends(get_db)):
    repo = AreaRepository()
    return repo.create(db, body.model_dump())

@router.get("/areas", response_model=List[AreaResponse])
def list_areas(skip: int = 0, limit: int = 100, only_active: bool = True, db: Session = Depends(get_db)):
    repo = AreaRepository()
    return repo.get_all(db, skip=skip, limit=limit, only_active=only_active)

@router.get("/areas/{area_id}", response_model=AreaResponse)
def get_area(area_id: int, db: Session = Depends(get_db)):
    repo = AreaRepository()
    obj = repo.get(db, area_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return obj

@router.put("/areas/{area_id}", response_model=AreaResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_area(area_id: int, body: AreaUpdate, db: Session = Depends(get_db)):
    repo = AreaRepository()
    obj = repo.get(db, area_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))

@router.delete("/areas/{area_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_area(area_id: int, db: Session = Depends(get_db)):
    repo = AreaRepository()
    if not repo.delete(db, area_id):
        raise HTTPException(status_code=404, detail="Área no encontrada")
    return None

@router.get("/plantas/{planta_id}/areas", response_model=List[AreaResponse])
def list_areas_by_planta(planta_id: int, db: Session = Depends(get_db)):
    repo = AreaRepository()
    return repo.get_by_planta(db, planta_id)


# ─── Puntos de Muestreo ──────────────────────────────────────

@router.post("/puntos-muestreo", response_model=PuntoMuestreoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_punto_muestreo(body: PuntoMuestreoCreate, db: Session = Depends(get_db)):
    repo = PuntoMuestreoRepository()
    return repo.create(db, body.model_dump())

@router.get("/puntos-muestreo", response_model=List[PuntoMuestreoResponse])
def list_puntos_muestreo(skip: int = 0, limit: int = 100, only_active: bool = True, db: Session = Depends(get_db)):
    repo = PuntoMuestreoRepository()
    return repo.get_all(db, skip=skip, limit=limit, only_active=only_active)

@router.get("/puntos-muestreo/{punto_id}", response_model=PuntoMuestreoResponse)
def get_punto_muestreo(punto_id: int, db: Session = Depends(get_db)):
    repo = PuntoMuestreoRepository()
    obj = repo.get(db, punto_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Punto de muestreo no encontrado")
    return obj

@router.put("/puntos-muestreo/{punto_id}", response_model=PuntoMuestreoResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_punto_muestreo(punto_id: int, body: PuntoMuestreoUpdate, db: Session = Depends(get_db)):
    repo = PuntoMuestreoRepository()
    obj = repo.get(db, punto_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Punto de muestreo no encontrado")
    return repo.update(db, obj, body.model_dump(exclude_unset=True))

@router.delete("/puntos-muestreo/{punto_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_punto_muestreo(punto_id: int, db: Session = Depends(get_db)):
    repo = PuntoMuestreoRepository()
    if not repo.delete(db, punto_id):
        raise HTTPException(status_code=404, detail="Punto de muestreo no encontrado")
    return None
