from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.dim_tables.equipo import Equipo

class EquipoRepository(BaseRepository[Equipo]):
    model = Equipo