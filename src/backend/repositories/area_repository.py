from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.area import Area

class AreaRepository(BaseRepository[Area]):

    model = Area

    
