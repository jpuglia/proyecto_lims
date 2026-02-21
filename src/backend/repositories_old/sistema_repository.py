from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.sistema import Sistema

class SistemaRepository(BaseRepository[Sistema]):

    model = Sistema