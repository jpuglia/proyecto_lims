from datetime import datetime, timezone
from sqlalchemy import Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped

from src.backend.models.base import Base


class RegulatoryBase(Base):
    """
    Modelo base para entidades regulatorias.

    - Soft delete obligatorio
    - Metadata completa de creación/modificación
    - eager_defaults activado
    - Compatible 21 CFR Part 11
    """

    __abstract__ = True

    # Fuerza materialización inmediata de defaults tras flush
    __mapper_args__ = {
        "eager_defaults": True
    }

    # =========================
    # ESTADO
    # =========================
    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # =========================
    # CREACIÓN
    # =========================
    creado_por: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=False
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # =========================
    # MODIFICACIÓN
    # =========================
    modificado_por: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=True
    )

    fecha_modificacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True
    )

    # =========================
    # DESACTIVACIÓN (SOFT DELETE)
    # =========================
    desactivado_por: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=True
    )

    fecha_desactivacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # =========================
    # SOFT DELETE REGULATORIO
    # =========================
    def desactivar(self, usuario_id: int) -> None:
        """
        Desactivación lógica obligatoria (21 CFR compliant).
        """

        if not self.activo:
            raise ValueError("El registro ya está desactivado")

        ahora = datetime.now(timezone.utc)

        self.activo = False
        self.desactivado_por = usuario_id
        self.fecha_desactivacion = ahora

        # El soft delete es una modificación
        self.modificado_por = usuario_id
        self.fecha_modificacion = ahora
