# src/backend/models/estado_analisis.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    UniqueConstraint
)
from sqlalchemy.orm import relationship

from src.backend.models.base import Base


class EstadoAnalisis(Base):
    """
    Catálogo de estados posibles para un Análisis.

    Tabla maestra regulatoria.
    """

    __tablename__ = "estado_analisis"

    id = Column(Integer, primary_key=True)

    nombre = Column(
        String(50),
        nullable=False,
        unique=True
    )

    activo = Column(
        Boolean,
        nullable=False,
        default=True
    )

    # =========================
    # RELATIONSHIPS
    # =========================

    analisis = relationship(
        "Analisis",
        back_populates="estado"
    )

    historiales = relationship(
        "HistorialEstadoAnalisis",
        back_populates="estado"
    )

    __table_args__ = (
        UniqueConstraint("nombre", name="uq_estado_analisis_nombre"),
    )
