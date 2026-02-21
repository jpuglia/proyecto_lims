from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from models.base import Base

class RecepcionServicio(Base):
    __tablename__ = "recepcion_servicio"

    id = Column(Integer, primary_key=True)

    recepcion_id = Column(
        Integer,
        ForeignKey("recepcion.id"),
        unique=True,
        nullable=False
    )

    sistema_id = Column(Integer, ForeignKey("sistema.id"), nullable=False)

    recepcion = relationship("Recepcion", back_populates="servicio")
