from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.dim_tables.estado_equipo import EstadoEquipo

class EstadoEquipoRepository(BaseRepository[EstadoEquipo]):

    model = EstadoEquipo