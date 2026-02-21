from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.backend.models.base import Base


class Permiso(Base):

    __tablename__ = "permiso"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(255), nullable=True)
