from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.resultado import Resultado

class ResultadoRepository(BaseRepository[Resultado]):
    
    model = Resultado