from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.cepa_referencia import CepaReferencia

class CepaRepository(BaseRepository[CepaReferencia]):

    model = CepaReferencia