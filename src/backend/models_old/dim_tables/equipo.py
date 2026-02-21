from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timezone

from models.base import Base


# ./src/backend/models/dim_tables/equipo.py
class Equipo(Base):
    __tablename__ = "equipo"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    estado_id = Column(Integer, ForeignKey("estado_equipo.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=False)

    estado = relationship("EstadoEquipo", back_populates="equipos")
    area = relationship("Area", back_populates="equipos")
    incubaciones = relationship("Incubacion", back_populates="equipo", cascade="all, delete-orphan")
    

