from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.backend.repositories.fact import (OrdenManufacturaRepository, ManufacturaRepository, 
                                           HistoricoEstadoManufacturaRepository, EstadoManufacturaRepository)
from src.backend.models.fact import Manufactura

class ManufacturingService:
    def __init__(self,
                 orden_repo: OrdenManufacturaRepository,
                 manufactura_repo: ManufacturaRepository,
                 historico_repo: HistoricoEstadoManufacturaRepository,
                 estado_repo: EstadoManufacturaRepository):
        self.orden_repo = orden_repo
        self.manufactura_repo = manufactura_repo
        self.historico_repo = historico_repo
        self.estado_repo = estado_repo

    def create_manufacture_process(self, db: Session, manufactura_data: dict, usuario_id: int) -> Manufactura:
        manufactura = self.manufactura_repo.create(db, manufactura_data)
        
        # Register history
        self.historico_repo.create(db, {
            "manufactura_id": manufactura.manufactura_id,
            "estado_manufactura_id": manufactura_data["estado_manufactura_id"],
            "usuario_id": usuario_id,
            "fecha": datetime.now(timezone.utc)
        })
        
        return manufactura

    def change_manufacture_state(self, db: Session, manufactura_id: int, nuevo_estado_id: int, usuario_id: int) -> Manufactura:
        manufactura = self.manufactura_repo.get(db, manufactura_id)
        if not manufactura:
            raise ValueError(f"Manufactura with ID {manufactura_id} not found")

        manufactura = self.manufactura_repo.update(db, manufactura, {"estado_manufactura_id": nuevo_estado_id})

        # Register history
        self.historico_repo.create(db, {
            "manufactura_id": manufactura_id,
            "estado_manufactura_id": nuevo_estado_id,
            "usuario_id": usuario_id,
            "fecha": datetime.now(timezone.utc)
        })

        return manufactura
