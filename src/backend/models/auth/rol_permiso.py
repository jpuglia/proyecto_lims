from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.backend.models.base import Base


class RolPermiso(Base):

    __tablename__ = "rol_permiso"

    id: Mapped[int] = mapped_column(primary_key=True)

    rol_id: Mapped[int] = mapped_column(
        ForeignKey("rol.id"),
        nullable=False
    )

    permiso_id: Mapped[int] = mapped_column(
        ForeignKey("permiso.id"),
        nullable=False
    )
