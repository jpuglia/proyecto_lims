# ./src/backend/models/audit/revision.py
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float,
    ForeignKey, BigInteger, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from src.backend.models.base import Base

class Revision(Base):
    __tablename__ = "revision"

    id = Column(Integer, primary_key=True)
    tabla = Column(String, nullable=False)
    registro_id = Column(BigInteger, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    fecha = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    conclusion = Column(String, nullable=True)
    estado_revision = Column(String, nullable=True)

    usuario = relationship("Usuario", back_populates="revisiones")