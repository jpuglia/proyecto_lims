from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.planta import Planta


class PlantaRepository(BaseRepository[Planta]):

    model = Planta

