from typing import List, Optional
from sqlalchemy.orm import Session

from src.backend.repositories.base import BaseRepository
from src.backend.models.dim import (Sistema, Planta, Area, TipoEquipo, EstadoEquipo, 
                                     EquipoInstrumento, ZonaEquipo, CalibracionCalificacionEquipo, 
                                     HistoricoEstadoEquipo, PuntoMuestreo)

class SistemaRepository(BaseRepository[Sistema]):
    def __init__(self):
        super().__init__(Sistema)

class PlantaRepository(BaseRepository[Planta]):
    def __init__(self):
        super().__init__(Planta)

class AreaRepository(BaseRepository[Area]):
    def __init__(self):
        super().__init__(Area)

    def get_by_planta(self, db: Session, planta_id: int) -> List[Area]:
        return db.query(self.model).filter(self.model.planta_id == planta_id).all()

class TipoEquipoRepository(BaseRepository[TipoEquipo]):
    def __init__(self):
        super().__init__(TipoEquipo)

class EstadoEquipoRepository(BaseRepository[EstadoEquipo]):
    def __init__(self):
        super().__init__(EstadoEquipo)

class EquipoInstrumentoRepository(BaseRepository[EquipoInstrumento]):
    def __init__(self):
        super().__init__(EquipoInstrumento)

    def get_by_area(self, db: Session, area_id: int) -> List[EquipoInstrumento]:
        return db.query(self.model).filter(self.model.area_id == area_id).all()

class ZonaEquipoRepository(BaseRepository[ZonaEquipo]):
    def __init__(self):
        super().__init__(ZonaEquipo)

class CalibracionCalificacionEquipoRepository(BaseRepository[CalibracionCalificacionEquipo]):
    def __init__(self):
        super().__init__(CalibracionCalificacionEquipo)

class HistoricoEstadoEquipoRepository(BaseRepository[HistoricoEstadoEquipo]):
    def __init__(self):
        super().__init__(HistoricoEstadoEquipo)

class PuntoMuestreoRepository(BaseRepository[PuntoMuestreo]):
    def __init__(self):
        super().__init__(PuntoMuestreo)
