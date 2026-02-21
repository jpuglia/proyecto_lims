from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.recepcion import Recepcion

class RecepcionRepository(BaseRepository[Recepcion]):

    model = Recepcion