from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.especificacion import Especificacion

class EspecificacionRepository(BaseRepository[Especificacion]):
    
    model = Especificacion