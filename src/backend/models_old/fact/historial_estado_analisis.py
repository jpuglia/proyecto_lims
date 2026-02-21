# src/backend/models/historial_estado_analisis.py

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship

from src.backend.models.base import Base


class HistorialEstadoAnalisis(Base):
    """
    Registra cada cambio de estado de un análisis.
    Entidad crítica para trazabilidad regulatoria (21 CFR Part 11).
    """

    __tablename__ = "historial_estado_analisis"

    id = Column(Integer, primary_key=True)

    analisis_id = Column(
        Integer,
        ForeignKey("analisis.id", ondelete="RESTRICT"),
        nullable=False
    )

    estado_id = Column(
        Integer,
        ForeignKey("estado_analisis.id", ondelete="RESTRICT"),
        nullable=False
    )

    fecha = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuario.id", ondelete="RESTRICT"),
        nullable=False
    )

    # =========================
    # RELATIONSHIPS
    # =========================

    analisis = relationship(
        "Analisis",
        back_populates="historial_estados"
    )

    estado = relationship(
        "EstadoAnalisis"
    )

    usuario = relationship(
        "Usuario"
    )

    # =========================
    # INDICES
    # =========================

    __table_args__ = (
        Index("ix_historial_analisis_id", "analisis_id"),
        Index("ix_historial_fecha", "fecha"),
    )
