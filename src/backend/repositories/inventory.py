from sqlalchemy.orm import Session
from src.backend.repositories.base import BaseRepository
from src.backend.models.inventory import (PolvoSuplemento, RecepcionPolvoSuplemento, StockPolvoSuplemento,
                                           UsoPolvoSuplemento, MedioPreparado, OrdenPreparacionMedio,
                                           EstadoQC, StockMedios, AprobacionMedios, UsoMedios, UsoCepa)

class PolvoSuplementoRepository(BaseRepository[PolvoSuplemento]):
    def __init__(self):
        super().__init__(PolvoSuplemento)

class RecepcionPolvoSuplementoRepository(BaseRepository[RecepcionPolvoSuplemento]):
    def __init__(self):
        super().__init__(RecepcionPolvoSuplemento)

class StockPolvoSuplementoRepository(BaseRepository[StockPolvoSuplemento]):
    def __init__(self):
        super().__init__(StockPolvoSuplemento)

class UsoPolvoSuplementoRepository(BaseRepository[UsoPolvoSuplemento]):
    def __init__(self):
        super().__init__(UsoPolvoSuplemento)

class MedioPreparadoRepository(BaseRepository[MedioPreparado]):
    def __init__(self):
        super().__init__(MedioPreparado)

class OrdenPreparacionMedioRepository(BaseRepository[OrdenPreparacionMedio]):
    def __init__(self):
        super().__init__(OrdenPreparacionMedio)

class EstadoQCRepository(BaseRepository[EstadoQC]):
    def __init__(self):
        super().__init__(EstadoQC)

class StockMediosRepository(BaseRepository[StockMedios]):
    def __init__(self):
        super().__init__(StockMedios)

class AprobacionMediosRepository(BaseRepository[AprobacionMedios]):
    def __init__(self):
        super().__init__(AprobacionMedios)

class UsoMediosRepository(BaseRepository[UsoMedios]):
    def __init__(self):
        super().__init__(UsoMedios)

class UsoCepaRepository(BaseRepository[UsoCepa]):
    def __init__(self):
        super().__init__(UsoCepa)
