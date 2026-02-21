from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey
)
from sqlalchemy.orm import relationship

from src.backend.models.base import Base


class Incubacion(Base):
    __tablename__ = "incubacion"

    id = Column(Integer, primary_key=True)

    analisis_id = Column(
        Integer,
        ForeignKey("analisis.id"),
        nullable=False
    )

    equipo_id = Column(
        Integer,
        ForeignKey("equipo.id"),
        nullable=False
    )

    # =========================
    # USUARIOS
    # =========================

    usuario_entrada_id = Column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=True
    )

    usuario_salida_id = Column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=True
    )

    # =========================
    # DATOS INCUBACIÓN
    # =========================

    entrada = Column(DateTime, nullable=True)
    salida = Column(DateTime, nullable=True)

    temp_registrada = Column(Float, nullable=True)
    unidad_temp = Column(String, nullable=True)

    # =========================
    # RELATIONSHIPS
    # =========================

    analisis = relationship(
        "Analisis",
        back_populates="incubaciones"
    )

    equipo = relationship(
        "Equipo",
        back_populates="incubaciones"
    )

    usuario_entrada = relationship(
        "Usuario",
        foreign_keys=[usuario_entrada_id]
    )

    usuario_salida = relationship(
        "Usuario",
        foreign_keys=[usuario_salida_id]
    )
