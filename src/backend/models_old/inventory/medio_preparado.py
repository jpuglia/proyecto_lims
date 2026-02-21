from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/fact/resultado_detalle.py
class ResultadoDetalle(Base):
    __tablename__ = "resultado_detalle"

    id = Column(Integer, primary_key=True)
    resultado_id = Column(Integer, ForeignKey("resultado.id"), nullable=False)
    especificacion_id = Column(Integer, ForeignKey("especificacion.id"), nullable=False)
    valor_obtenido = Column(Float, nullable=True)
    cumple = Column(Boolean, nullable=True)

    resultado = relationship("Resultado", back_populates="detalles")
    especificacion = relationship("Especificacion", back_populates="resultado_detalles")