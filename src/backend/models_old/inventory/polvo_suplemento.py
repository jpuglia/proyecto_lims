from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/inventory/polvo_suplemento.py
class PolvoSuplemento(Base):
    __tablename__ = "polvo_suplemento"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=True)
    lote = Column(String, nullable=True)
    vence = Column(Date, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    usos = relationship("UsoPolvoSuplemento", back_populates="polvo", cascade="all, delete-orphan")