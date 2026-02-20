from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/fact/uso_medios.py
class UsoMedios(Base):
    __tablename__ = "uso_medios"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stock_medios.id"), nullable=False)

    analisis = relationship("Analisis", back_populates="uso_medios")
    stock = relationship("StockMedios", back_populates="usos_medios")