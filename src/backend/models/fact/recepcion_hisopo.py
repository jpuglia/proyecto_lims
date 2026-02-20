from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from models.base import Base

class RecepcionHisopo(Base):
    __tablename__ = "recepcion_hisopo"

    id = Column(Integer, primary_key=True)

    recepcion_id = Column(
        Integer,
        ForeignKey("recepcion.id"),
        unique=True,
        nullable=False
    )

    planta_id = Column(Integer, ForeignKey("planta.id"), nullable=False)

    recepcion = relationship("Recepcion", back_populates="hisopo")
