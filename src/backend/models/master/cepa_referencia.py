from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/master/cepa_referencia.py
class CepaReferencia(Base):
    __tablename__ = "cepa_referencia"

    id = Column(Integer, primary_key=True)
    codigo_atcc = Column(String, unique=True, nullable=True)
    lote = Column(String, nullable=True)
    pase = Column(Integer, nullable=True)
    fecha_control = Column(Date, nullable=True)
    estado_biologico = Column(String, nullable=True)

    usos_cepa = relationship("UsoCepa", back_populates="cepa", cascade="all, delete-orphan")