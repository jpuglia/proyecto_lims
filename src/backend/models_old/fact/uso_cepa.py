from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/fact/uso_cepa.py
class UsoCepa(Base):
    __tablename__ = "uso_cepa"

    id = Column(Integer, primary_key=True)
    cepa_id = Column(Integer, ForeignKey("cepa_referencia.id"), nullable=False)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)

    cepa = relationship("CepaReferencia", back_populates="usos_cepa")
    analisis = relationship("Analisis", back_populates="uso_cepas")