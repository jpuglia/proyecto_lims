from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.repositories.dim import TipoEquipoRepository, EstadoEquipoRepository
from src.backend.repositories.fact import EstadoManufacturaRepository, EstadoSolicitudRepository, EstadoAnalisisRepository
from src.backend.repositories.master import CepaReferenciaRepository
from src.backend.api.schemas.master import CepaReferenciaCreate, CepaReferenciaResponse
from src.backend.api.security import get_current_user, require_role

router = APIRouter(dependencies=[Depends(get_current_user)])

_ESCRITURA = ["administrador", "supervisor"]

# ─── Catálogos ──────────────────────────────────────────────────

@router.get("/catalogos", response_model=Dict[str, List[Dict[str, Any]]])
def get_all_catalogs(db: Session = Depends(get_db)):
    """
    Returns all lookup tables (catalogs) in a single call to minimize frontend latency.
    """
    tipo_equipo_repo = TipoEquipoRepository()
    estado_equipo_repo = EstadoEquipoRepository()
    estado_m_repo = EstadoManufacturaRepository()
    estado_s_repo = EstadoSolicitudRepository()
    estado_a_repo = EstadoAnalisisRepository()

    return {
        "tipos_equipo": [
            {"id": item.tipo_equipo_id, "nombre": item.nombre} 
            for item in tipo_equipo_repo.get_all(db)
        ],
        "estados_equipo": [
            {"id": item.estado_equipo_id, "nombre": item.nombre} 
            for item in estado_equipo_repo.get_all(db)
        ],
        "estados_manufactura": [
            {"id": item.estado_manufactura_id, "nombre": item.nombre} 
            for item in estado_m_repo.get_all(db)
        ],
        "estados_solicitud": [
            {"id": item.estado_solicitud_id, "nombre": item.nombre} 
            for item in estado_s_repo.get_all(db)
        ],
        "estados_analisis": [
            {"id": item.estado_analisis_id, "nombre": item.nombre} 
            for item in estado_a_repo.get_all(db)
        ],
    }


# ─── Cepario (Cepas de Referencia) ───────────────────────────

@router.post("/cepas", response_model=CepaReferenciaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*_ESCRITURA))])
def create_cepa(body: CepaReferenciaCreate, db: Session = Depends(get_db)):
    repo = CepaReferenciaRepository()
    return repo.create(db, body.model_dump())

@router.get("/cepas", response_model=List[CepaReferenciaResponse])
def list_cepas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = CepaReferenciaRepository()
    return repo.get_all(db, skip=skip, limit=limit)

@router.get("/cepas/{cepa_id}", response_model=CepaReferenciaResponse)
def get_cepa(cepa_id: int, db: Session = Depends(get_db)):
    repo = CepaReferenciaRepository()
    obj = repo.get(db, cepa_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cepa de referencia no encontrada")
    return obj

@router.delete("/cepas/{cepa_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("administrador"))])
def delete_cepa(cepa_id: int, db: Session = Depends(get_db)):
    repo = CepaReferenciaRepository()
    if not repo.delete(db, cepa_id):
        raise HTTPException(status_code=404, detail="Cepa de referencia no encontrada")
    return None
