from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/dim_tables/area.py
class Area(Base):
    __tablename__ = "area"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", back_populates="areas")
    equipos = relationship("Equipo", back_populates="area", cascade="all, delete-orphan")
    puntos_muestreo = relationship("PuntoMuestreo", back_populates="area", cascade="all, delete-orphan")
