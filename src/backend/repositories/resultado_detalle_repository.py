from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.resultado_detalle import ResultadoDetalle

class ResultadoDetalleRepository(BaseRepository[ResultadoDetalle]):

    model = ResultadoDetalle