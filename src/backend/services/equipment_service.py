from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from src.backend.repositories.dim import (EquipoInstrumentoRepository, 
                                          HistoricoEstadoEquipoRepository, 
                                          EstadoEquipoRepository)
from src.backend.models.dim import EquipoInstrumento
from src.backend.core.exceptions import EntityNotFoundException
from src.backend.core.logging import get_logger

logger = get_logger(__name__)

class EquipmentService:
    def __init__(self, 
                 equipo_repo: EquipoInstrumentoRepository, 
                 historico_repo: HistoricoEstadoEquipoRepository,
                 estado_repo: EstadoEquipoRepository):
        self.equipo_repo = equipo_repo
        self.historico_repo = historico_repo
        self.estado_repo = estado_repo

    def create_equipo(self, db: Session, equipo_data: dict) -> EquipoInstrumento:
        equipo = self.equipo_repo.create(db, equipo_data)
        return equipo

    def change_equipment_state(self, db: Session, equipo_id: int, nuevo_estado_id: int, usuario_id: int) -> EquipoInstrumento:
        # Check if equipo exists
        equipo = self.equipo_repo.get(db, equipo_id)
        if not equipo:
            raise EntityNotFoundException("Equipo", equipo_id)

        # Update the state of the equipment
        logger.info(f"Changing state for equipment {equipo_id} to {nuevo_estado_id} by user {usuario_id}")
        equipo = self.equipo_repo.update(db, equipo, {"estado_equipo_id": nuevo_estado_id})

        # Register history
        self.historico_repo.create(db, {
            "equipo_instrumento_id": equipo_id,
            "estado_equipo_id": nuevo_estado_id,
            "usuario_id": usuario_id,
            "fecha": datetime.now(timezone.utc)
        })
        
        return equipo
