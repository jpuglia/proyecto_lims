import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from src.backend.api.dependencies import get_db
from src.backend.api.security import get_current_user, require_role, get_user_roles
from src.backend.api.schemas.inspection import SamplingCreate, SamplingResponse, SamplingUpdate, SamplingBatchSubmit
from src.backend.models.inspection import Sampling
from src.backend.models.auth import Usuario

router = APIRouter(prefix="/samplings", tags=["Inspection"])

@router.post("/", response_model=SamplingResponse, status_code=status.HTTP_201_CREATED)
def create_sampling(
    sampling_in: SamplingCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("inspector", "administrador"))
):
    """
    Crea un nuevo registro de muestreo.
    Solo accesible por usuarios con rol 'inspector' o 'administrador'.
    """
    # Usar el ID del usuario actual si no se proporciona uno válido o para forzar auditoría
    inspector_id = sampling_in.inspector_id
    user_roles = get_user_roles(current_user)
    if "administrador" not in user_roles:
        inspector_id = current_user.usuario_id
        
    nuevo_muestreo = Sampling(
        inspector_id=inspector_id,
        request_id=sampling_in.request_id,
        start_datetime=sampling_in.start_datetime,
        end_datetime=sampling_in.end_datetime,
        product_id=sampling_in.product_id,
        lot_id=sampling_in.lot_id,
        lot_number=sampling_in.lot_number,
        sampling_point_id=sampling_in.sampling_point_id,
        extracted_quantity=sampling_in.extracted_quantity,
        sample_type=sampling_in.sample_type,
        equipo_id=sampling_in.equipo_id,
        operario_muestreado_id=sampling_in.operario_muestreado_id,
        area_id=sampling_in.area_id,
        region_swabbed=sampling_in.region_swabbed,
        destination=sampling_in.destination,
        batch_id=sampling_in.batch_id,
        status="PENDING_REVIEW"
    )
    
    db.add(nuevo_muestreo)
    db.commit()
    db.refresh(nuevo_muestreo)
    return nuevo_muestreo

@router.get("/", response_model=List[SamplingResponse])
def list_samplings(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos los muestreos registrados, permitiendo filtrar por estado."""
    query = db.query(Sampling).options(joinedload(Sampling.sampling_point))
    if status_filter:
        query = query.filter(Sampling.status == status_filter)
    return query.all()

@router.get("/{sampling_id}", response_model=SamplingResponse)
def get_sampling(
    sampling_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene un muestreo específico por ID."""
    sampling = db.query(Sampling).filter(Sampling.id == sampling_id).first()
    if not sampling:
        raise HTTPException(status_code=404, detail="Muestreo no encontrado")
    return sampling

@router.patch("/{sampling_id}/review", response_model=SamplingResponse)
def review_sampling(
    sampling_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("inspector", "administrador"))
):
    """
    Marca un muestreo como revisado.
    Extrae automáticamente la identidad del revisor desde el contexto.
    """
    sampling = db.query(Sampling).filter(Sampling.id == sampling_id).first()
    if not sampling:
        raise HTTPException(status_code=404, detail="Muestreo no encontrado")
    
    if sampling.status != "PENDING_REVIEW":
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede revisar un muestreo en estado {sampling.status}"
        )
    
    sampling.status = "PENDING_SUBMISSION"
    sampling.reviewer_id = current_user.usuario_id
    sampling.review_timestamp = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(sampling)
    return sampling

@router.patch("/batch/{batch_id}/review", status_code=status.HTTP_200_OK)
def review_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("inspector", "administrador"))
):
    """
    Marca todos los muestreos de un lote (batch_id) como revisados.
    """
    samplings = db.query(Sampling).filter(
        Sampling.batch_id == batch_id,
        Sampling.status == "PENDING_REVIEW"
    ).all()
    
    if not samplings:
        raise HTTPException(
            status_code=404, 
            detail=f"No se encontraron muestreos pendientes de revisión para el lote {batch_id}"
        )
    
    review_timestamp = datetime.now(timezone.utc)
    for sampling in samplings:
        sampling.status = "PENDING_SUBMISSION"
        sampling.reviewer_id = current_user.usuario_id
        sampling.review_timestamp = review_timestamp
        
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar la revisión por lote: {str(e)}")
        
    return {
        "message": f"Se han validado exitosamente {len(samplings)} muestreos del lote",
        "batch_id": batch_id,
        "count": len(samplings)
    }

@router.post("/batch-submit", status_code=status.HTTP_200_OK)
def batch_submit_samplings(
    batch_in: SamplingBatchSubmit,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role("inspector", "administrador"))
):
    """
    Envía múltiples muestreos en un solo lote.
    Garantiza atomicidad mediante una transacción.
    """
    if not batch_in.sampling_ids:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un ID de muestreo")
    
    # Iniciar transacción explícita
    # SQLAlchemy Session ya maneja una transacción, usaremos db.commit() al final.
    
    samplings = db.query(Sampling).filter(Sampling.id.in_(batch_in.sampling_ids)).all()
    
    if len(samplings) != len(batch_in.sampling_ids):
        # Encontrar IDs faltantes
        found_ids = [s.id for s in samplings]
        missing_ids = [id for id in batch_in.sampling_ids if id not in found_ids]
        raise HTTPException(
            status_code=404, 
            detail=f"Algunos muestreos no fueron encontrados: {missing_ids}"
        )
    
    submission_id = str(uuid.uuid4())
    submission_timestamp = datetime.now(timezone.utc)
    
    for sampling in samplings:
        if sampling.status != "PENDING_SUBMISSION":
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"El muestreo {sampling.id} no está listo para envío (Estado: {sampling.status})"
            )
        
        sampling.status = "SUBMITTED"
        sampling.submission_id = submission_id
        sampling.submission_timestamp = submission_timestamp
        
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar el lote: {str(e)}")
        
    return {
        "message": f"Se han enviado exitosamente {len(samplings)} muestreos",
        "submission_id": submission_id,
        "count": len(samplings)
    }
