# src/backend/models/fact/analisis.py
from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.backend.models.audit.base_model import RegulatoryBase


if TYPE_CHECKING:
    from src.backend.models.fact.historial_estado_analisis import (
        HistorialEstadoAnalisis
    )


class Analisis(RegulatoryBase):
    __tablename__ = "analisis"

    # =========================================================
    # PK
    # =========================================================

    id: Mapped[int] = mapped_column(primary_key=True)

    # =========================================================
    # FK
    # =========================================================

    recepcion_id: Mapped[int] = mapped_column(
        ForeignKey("recepcion.id"),
        nullable=False
    )

    metodo_version_id: Mapped[int] = mapped_column(
        ForeignKey("metodo_version.id"),
        nullable=False
    )

    estado_id: Mapped[int] = mapped_column(
        ForeignKey("estado_analisis.id"),
        nullable=False
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id"),
        nullable=False
    )

    # =========================================================
    # CAMPOS DE NEGOCIO
    # =========================================================

    fecha_inicio: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    fecha_programada: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    ultimo_cambio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    # =========================================================
    # RELACIONES
    # =========================================================

    recepcion = relationship(
        "Recepcion",
        back_populates="analisis"
    )

    metodo = relationship(
        "MetodoVersion",
        back_populates="analisis"
    )

    estado = relationship(
        "EstadoAnalisis",
        back_populates="analisis"
    )

    usuario = relationship(
        "Usuario",
        back_populates="analisis_ejecutado"
    )

    historial_estados: Mapped[List['HistorialEstadoAnalisis']] = relationship(
        "HistorialEstadoAnalisis",
        back_populates="analisis",
        cascade="all, delete-orphan",
        order_by="HistorialEstadoAnalisis.fecha"
    )

    incubaciones = relationship(
        "Incubacion",
        back_populates="analisis",
        cascade="all, delete-orphan"
    )

    resultados = relationship(
        "Resultado",
        back_populates="analisis",
        cascade="all, delete-orphan"
    )

    uso_medios = relationship(
        "UsoMedios",
        back_populates="analisis",
        cascade="all, delete-orphan"
    )

    uso_cepas = relationship(
        "UsoCepa",
        back_populates="analisis",
        cascade="all, delete-orphan"
    )
