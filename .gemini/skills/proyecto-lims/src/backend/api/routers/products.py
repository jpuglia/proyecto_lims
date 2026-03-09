"""Products router – management of laboratory products."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.database.db_manager import db_manager
from src.backend.models.master import Producto
from src.backend.repositories.master import ProductoRepository
from src.backend.api.schemas.master import ProductoCreate, ProductoResponse, ProductoUpdate
from src.backend.api.security import require_role

router = APIRouter()

_ESCRITURA = ["administrador", "supervisor"]

@router.get("", response_model=List[ProductoResponse])
def list_productos(skip: int = 0, limit: int = 100, only_active: bool = True, db: Session = Depends(db_manager.get_session)):
    repo = ProductoRepository()
    return repo.get_all(db, skip=skip, limit=limit, only_active=only_active)

@router.get("/{producto_id}", response_model=ProductoResponse)
def get_producto(producto_id: int, db: Session = Depends(db_manager.get_session)):
    repo = ProductoRepository()
    producto = repo.get(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_producto(body: ProductoCreate, db: Session = Depends(db_manager.get_session)):
    repo = ProductoRepository()
    return repo.create(db, body.model_dump())

@router.put("/{producto_id}", response_model=ProductoResponse,
            dependencies=[Depends(require_role(*_ESCRITURA))])
def update_producto(producto_id: int, body: ProductoUpdate, db: Session = Depends(db_manager.get_session)):
    repo = ProductoRepository()
    producto = repo.get(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return repo.update(db, producto, body.model_dump(exclude_unset=True))

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_producto(producto_id: int, db: Session = Depends(db_manager.get_session)):
    repo = ProductoRepository()
    producto = repo.get(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    repo.delete(db, producto_id)
