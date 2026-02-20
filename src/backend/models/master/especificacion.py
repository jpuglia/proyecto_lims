from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/master/especificacion.py
class Especificacion(Base):
    __tablename__ = "especificacion"

    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("producto.id"), nullable=False)
    parametro = Column(String, nullable=False)
    tipo_limite = Column(String, nullable=True)
    valor_min = Column(Float, nullable=True)
    valor_max = Column(Float, nullable=True)
    unidad = Column(String, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    producto = relationship("Producto", back_populates="especificaciones")
    resultado_detalles = relationship("ResultadoDetalle", back_populates="especificacion", cascade="all, delete-orphan")