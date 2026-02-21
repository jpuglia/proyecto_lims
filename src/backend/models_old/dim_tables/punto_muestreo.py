from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/dim_tables/punto_muestreo.py
class PuntoMuestreo(Base):
    __tablename__ = "punto_muestreo"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    area = relationship("Area", back_populates="puntos_muestreo")
    recepciones = relationship("Recepcion", back_populates="punto_muestreo", cascade="all, delete-orphan")