# src/backend/models/estado_recepcion.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    UniqueConstraint
)
from sqlalchemy.orm import relationship

from src.backend.models.base import Base


class EstadoRecepcion(Base):
    """
    Catálogo de estados posibles para una Recepción.

    Tabla maestra regulatoria.
    No debe eliminarse físicamente.
    """

    __tablename__ = "estado_recepcion"

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

    recepciones = relationship(
        "Recepcion",
        back_populates="estado"
    )

    __table_args__ = (
        UniqueConstraint("nombre", name="uq_estado_recepcion_nombre"),
    )
