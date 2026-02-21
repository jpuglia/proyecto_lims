from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.fact.recepcion_producto import RecepcionProducto

class RecepcionProductoRepository(BaseRepository[RecepcionProducto]):

    model = RecepcionProducto