from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.backend.repositories.inventory import (RecepcionPolvoSuplementoRepository, StockPolvoSuplementoRepository,
                                                UsoPolvoSuplementoRepository, OrdenPreparacionMedioRepository,
                                                StockMediosRepository, AprobacionMediosRepository, EstadoQCRepository)
from src.backend.models.inventory import RecepcionPolvoSuplemento, OrdenPreparacionMedio, StockMedios

class InventoryService:
    def __init__(self,
                 recepcion_polvo_repo: RecepcionPolvoSuplementoRepository,
                 stock_polvo_repo: StockPolvoSuplementoRepository,
                 uso_polvo_repo: UsoPolvoSuplementoRepository,
                 orden_prep_repo: OrdenPreparacionMedioRepository,
                 stock_medios_repo: StockMediosRepository,
                 aprob_medios_repo: AprobacionMediosRepository,
                 estado_qc_repo: EstadoQCRepository):
        self.recepcion_polvo_repo = recepcion_polvo_repo
        self.stock_polvo_repo = stock_polvo_repo
        self.uso_polvo_repo = uso_polvo_repo
        self.orden_prep_repo = orden_prep_repo
        self.stock_medios_repo = stock_medios_repo
        self.aprob_medios_repo = aprob_medios_repo
        self.estado_qc_repo = estado_qc_repo

    def register_powder_reception(self, db: Session, recepcion_data: dict) -> RecepcionPolvoSuplemento:
        recepcion = self.recepcion_polvo_repo.create(db, recepcion_data)
        
        # Add to stock
        self.stock_polvo_repo.create(db, {
            "recepcion_polvo_suplemento_id": recepcion.recepcion_polvo_suplemento_id,
            "cantidad": recepcion_data["cantidad"]
        })
        
        return recepcion

    def prepare_culture_media(self, db: Session, orden_data: dict, consumos: list) -> OrdenPreparacionMedio:
        orden = self.orden_prep_repo.create(db, orden_data)
        
        # Consume logic
        for consumo in consumos:
            stock_polvo = self.stock_polvo_repo.get(db, consumo["stock_polvo_suplemento_id"])
            if stock_polvo and stock_polvo.cantidad >= consumo["cantidad"]:
                self.uso_polvo_repo.create(db, {
                    "stock_polvo_suplemento_id": consumo["stock_polvo_suplemento_id"],
                    "orden_preparacion_medio_id": orden.orden_preparacion_medio_id,
                    "cantidad": consumo["cantidad"],
                    "unidad": consumo["unidad"]
                })
                # Decrease stock
                self.stock_polvo_repo.update(db, stock_polvo, {"cantidad": stock_polvo.cantidad - consumo["cantidad"]})
            else:
                raise ValueError("Not enough stock available for production.")
        
        # Generate initial stock of the prepared media in QC "Pendiente" State
        estado_pendiente = self.estado_qc_repo.get_all(db) # In a real implementation we would fetch by name "Pendiente"
        
        self.stock_medios_repo.create(db, {
            "orden_preparacion_medio_id": orden.orden_preparacion_medio_id,
            "lote_interno": orden_data["lote"],
            "vence": orden_data.get("vence", datetime.now(timezone.utc)), # Simplify logic for example
            "estado_qc_id": estado_pendiente[0].estado_qc_id if estado_pendiente else 1 
        })
        
        return orden
