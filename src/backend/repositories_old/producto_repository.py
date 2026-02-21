from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.master.producto import Producto


class ProductoRepository(BaseRepository[Producto]):

    model = Producto
