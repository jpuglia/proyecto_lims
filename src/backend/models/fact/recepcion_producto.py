from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from models.base import Base

class RecepcionProducto(Base):
    __tablename__ = "recepcion_producto"

    id = Column(Integer, primary_key=True)

    recepcion_id = Column(
        Integer,
        ForeignKey("recepcion.id"),
        unique=True,
        nullable=False
    )

    producto_id = Column(Integer, ForeignKey("producto.id"), nullable=False)

    lote = Column(String, nullable=False)

    recepcion = relationship("Recepcion", back_populates="producto")
