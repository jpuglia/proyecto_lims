from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/fact/resultado.py
class Resultado(Base):
    __tablename__ = "resultado"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    fecha_reporte = Column(DateTime, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    analisis = relationship("Analisis", back_populates="resultados")
    usuario = relationship("Usuario", back_populates="resultados_reportados")
    detalles = relationship("ResultadoDetalle", back_populates="resultado", cascade="all, delete-orphan")