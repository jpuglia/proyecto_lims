from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float,
    ForeignKey, BigInteger, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from src.backend.models.base import Base

# ./src/backend/models/auth/usuario_rol.py
class UsuarioRol(Base):
    __tablename__ = "usuario_rol"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    rol_id = Column(Integer, ForeignKey("rol.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")