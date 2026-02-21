from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.dim_tables.punto_muestreo import PuntoMuestreo

class PuntoMuestreoRepository(BaseRepository[PuntoMuestreo]):

    model = PuntoMuestreo