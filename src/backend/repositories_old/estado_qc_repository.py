from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.dim_tables.estado_qc import EstadoQC

class EstadoQCRepository(BaseRepository[EstadoQC]):

    model = EstadoQC