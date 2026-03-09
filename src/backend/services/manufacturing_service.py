from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from src.backend.repositories.fact import (OrdenManufacturaRepository, ManufacturaRepository, 
                                           HistoricoEstadoManufacturaRepository, EstadoManufacturaRepository,
                                           ManufacturaOperarioRepository)
from src.backend.models.fact import Manufactura, OrdenManufactura, HistoricoEstadoManufactura, ManufacturaOperario, UsoMaterialManufactura

class ManufacturingService:
    def __init__(self,
                 orden_repo: OrdenManufacturaRepository,
                 manufactura_repo: ManufacturaRepository,
                 historico_repo: HistoricoEstadoManufacturaRepository,
                 estado_repo: EstadoManufacturaRepository,
                 operario_repo: ManufacturaOperarioRepository,
                 sample_service = None):
        self.orden_repo = orden_repo
        self.manufactura_repo = manufactura_repo
        self.historico_repo = historico_repo
        self.estado_repo = estado_repo
        self.operario_repo = operario_repo
        self.sample_service = sample_service

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

        # Set timestamps if starting or finishing
        update_data = {"estado_manufactura_id": nuevo_estado_id}
        if nuevo_estado_id == 6:  # 'En curso'
            if not manufactura.fecha_inicio:
                update_data["fecha_inicio"] = datetime.now(timezone.utc)
        elif nuevo_estado_id == 7:  # 'Finalizado'
            if not manufactura.fecha_fin:
                update_data["fecha_fin"] = datetime.now(timezone.utc)

        manufactura = self.manufactura_repo.update(db, manufactura, update_data)

        # Register history
        self.historico_repo.create(db, {
            "manufactura_id": manufactura_id,
            "estado_manufactura_id": nuevo_estado_id,
            "usuario_id": usuario_id,
            "fecha": datetime.now(timezone.utc)
        })

        # TRIGGER: Auto-generate SolicitudMuestreo when process starts ('En curso' ID 6)
        if nuevo_estado_id == 6 and self.sample_service:
            self.sample_service.create_sampling_request(db, {
                "usuario_id": usuario_id,
                "tipo": "Producto",
                "orden_manufactura_id": manufactura.orden_manufactura_id,
                "estado_solicitud_id": 1, # 'Pendiente'
                "observacion": f"Solicitud automática por inicio de manufactura {manufactura_id}"
            }, usuario_id=usuario_id)

        return manufactura

    def assign_operator_to_process(self, db: Session, data: dict) -> ManufacturaOperario:
        """Asigna un operario a un proceso de manufactura."""
        if not data.get("entrada"):
            data["entrada"] = datetime.now(timezone.utc)
        return self.operario_repo.create(db, data)

    def register_material_usage(self, db: Session, data: dict) -> UsoMaterialManufactura:
        """Registra el uso de materia prima en un proceso de manufactura."""
        uso = UsoMaterialManufactura(
            manufactura_id=data["manufactura_id"],
            stock_polvo_suplemento_id=data["stock_polvo_suplemento_id"],
            cantidad=data["cantidad"],
            unidad=data["unidad"],
            fecha_uso=datetime.now(timezone.utc)
        )
        db.add(uso)
        db.commit()
        db.refresh(uso)
        return uso

    def get_operators_by_process(self, db: Session, manufactura_id: int) -> List[ManufacturaOperario]:
        """Retorna todos los operarios asignados a un proceso."""
        return (
            db.query(ManufacturaOperario)
            .options(joinedload(ManufacturaOperario.operario))
            .filter(ManufacturaOperario.manufactura_id == manufactura_id)
            .all()
        )

    def get_materials_by_process(self, db: Session, manufactura_id: int) -> List[UsoMaterialManufactura]:
        """Retorna todos los materiales registrados en un proceso."""
        return (
            db.query(UsoMaterialManufactura)
            .options(joinedload(UsoMaterialManufactura.stock_polvo))
            .filter(UsoMaterialManufactura.manufactura_id == manufactura_id)
            .all()
        )

    def get_orden_trazabilidad(self, db: Session, orden_id: int) -> Optional[OrdenManufactura]:
        """Retorna la orden con sus procesos y solicitudes anidadas."""
        return (
            db.query(OrdenManufactura)
            .options(
                joinedload(OrdenManufactura.manufacturas).joinedload(Manufactura.estado),
                joinedload(OrdenManufactura.solicitudes)
            )
            .filter(OrdenManufactura.orden_manufactura_id == orden_id)
            .first()
        )

    def get_procesos_by_orden(self, db: Session, orden_id: int) -> List[Manufactura]:
        """Retorna todos los procesos de manufactura de una orden específica."""
        return (
            db.query(Manufactura)
            .options(joinedload(Manufactura.estado))
            .filter(Manufactura.orden_manufactura_id == orden_id)
            .all()
        )

    def get_historial_proceso(self, db: Session, manufactura_id: int) -> List[HistoricoEstadoManufactura]:
        """Retorna el historial de cambios de estado de un proceso."""
        return (
            db.query(HistoricoEstadoManufactura)
            .options(joinedload(HistoricoEstadoManufactura.estado_manufactura))
            .filter(HistoricoEstadoManufactura.manufactura_id == manufactura_id)
            .order_by(HistoricoEstadoManufactura.fecha.asc())
            .all()
        )
