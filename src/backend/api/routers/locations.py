from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.api.schemas.dim import PlantaCreate, PlantaUpdate, PlantaResponse
from src.backend.repositories.dim import PlantaRepository
from src.backend.api.security import get_current_user, require_role

router = APIRouter(dependencies=[Depends(get_current_user)])

_ESCRITURA = ["administrador", "supervisor"]

@router.post("/plantas", response_model=PlantaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_planta(body: PlantaCreate, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    return repo.create(db, body.model_dump())

@router.get("/plantas", response_model=List[PlantaResponse])
def list_plantas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    return repo.get_all(db, skip=skip, limit=limit)

@router.get("/plantas/{planta_id}", response_model=PlantaResponse)
def get_planta(planta_id: int, db: Session = Depends(get_db)):
    repo = PlantaRepository()
    planta = repo.get(db, planta_id)
    if not planta:
        raise HTTPException(status_code=404, detail="Planta no encontrada")
    return planta

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
