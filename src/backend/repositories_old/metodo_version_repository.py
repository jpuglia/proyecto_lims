from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.metodo_version import MetodoVersion

class MetodoVersionRepository(BaseRepository[MetodoVersion]):

    model = MetodoVersion