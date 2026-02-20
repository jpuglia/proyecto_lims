from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.recepcion_servicio import RecepcionServicio

class RecepcionServicioRepository(BaseRepository[RecepcionServicio]):

    model = RecepcionServicio