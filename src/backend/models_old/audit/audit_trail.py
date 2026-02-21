from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float,
    ForeignKey, BigInteger, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from src.backend.models.base import Base

# ./src/backend/models/audit/audit_trail.py
class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id = Column(BigInteger, primary_key=True)
    tabla = Column(String, nullable=False)
    registro_id = Column(BigInteger, nullable=False)
    columna = Column(String, nullable=True)
    old_val = Column(String, nullable=True)
    new_val = Column(String, nullable=True)
    accion = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="audit_trails")