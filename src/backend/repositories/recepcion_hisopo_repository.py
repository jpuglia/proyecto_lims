from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.recepcion_hisopo import RecepcionHisopo

class RecepcionHisopoRepository(BaseRepository[RecepcionHisopo]):

    model = RecepcionHisopo