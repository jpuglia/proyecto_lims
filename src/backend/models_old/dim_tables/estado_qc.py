from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship

from models.base import Base


# ./src/backend/models/dim_tables/estado_qc.py
class EstadoQC(Base):
    __tablename__ = "estado_qc"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    stock_medios = relationship("StockMedios", back_populates="estado_qc", cascade="all, delete-orphan")