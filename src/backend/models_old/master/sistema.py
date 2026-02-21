from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float,
    ForeignKey, BigInteger, UniqueConstraint, Text, Enum
)
from src.backend.models.enums import enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from src.backend.models.base import Base

class Servicios(enum.Enum):
    AIRE_COMPRIMIDO = 'aire_comprimido'
    AGUA = 'agua'
    NITROGENO = 'nitrogeno'

# ./src/backend/models/dim_tables/sistema.py
class Sistema(Base):
    __tablename__ = "sistema"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    plantas = relationship("Planta", back_populates="sistema", cascade="all, delete-orphan")
