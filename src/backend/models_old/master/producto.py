from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timezone

from models.base import Base

# ./src/backend/models/master/producto.py
class Producto(Base):
    __tablename__ = "producto"
    __table_args__ = (UniqueConstraint("codigo", name="uq_producto_codigo"),
                      UniqueConstraint("nombre", name="uq_producto_nombre"))

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", back_populates="productos")
    especificaciones = relationship("Especificacion", back_populates="producto", cascade="all, delete-orphan")
    recepciones = relationship("Recepcion", back_populates="producto", cascade="all, delete-orphan")