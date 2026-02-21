from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.incubacion import Incubacion

class IncubacionRepository(BaseRepository[Incubacion]):

    model = Incubacion
