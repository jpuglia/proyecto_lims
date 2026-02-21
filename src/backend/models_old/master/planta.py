from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/dim_tables/planta.py
class Planta(Base):
    __tablename__ = "planta"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    sistema_id = Column(Integer, ForeignKey("sistema.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    sistema = relationship("Sistema", back_populates="plantas")
    areas = relationship("Area", back_populates="planta", cascade="all, delete-orphan")
    productos = relationship("Producto", back_populates="planta", cascade="all, delete-orphan")


