from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from models.base import Base


# ./src/backend/models/dim_tables/estado_equipo.py
class EstadoEquipo(Base):
    __tablename__ = "estado_equipo"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    equipos = relationship("Equipo", back_populates="estado", cascade="all, delete-orphan")