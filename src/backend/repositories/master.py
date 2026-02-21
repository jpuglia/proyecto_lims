from typing import List, Optional
from sqlalchemy.orm import Session

from src.backend.repositories.base import BaseRepository
from src.backend.models.master import Producto, Especificacion, MetodoVersion, CepaReferencia

class ProductoRepository(BaseRepository[Producto]):
    def __init__(self):
        super().__init__(Producto)
        
    def get_by_codigo(self, db: Session, codigo: str) -> Optional[Producto]:
        return db.query(self.model).filter(self.model.codigo == codigo).first()

class EspecificacionRepository(BaseRepository[Especificacion]):
    def __init__(self):
        super().__init__(Especificacion)

    def get_by_producto(self, db: Session, producto_id: int) -> List[Especificacion]:
        return db.query(self.model).filter(self.model.producto_id == producto_id, self.model.activo == True).all()

class MetodoVersionRepository(BaseRepository[MetodoVersion]):
    def __init__(self):
        super().__init__(MetodoVersion)

class CepaReferenciaRepository(BaseRepository[CepaReferencia]):
    def __init__(self):
        super().__init__(CepaReferencia)
