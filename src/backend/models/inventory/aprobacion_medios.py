from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/inventory/aprobacion_medios.py
class AprobacionMedios(Base):
    __tablename__ = "aprobacion_medios"

    id = Column(Integer, primary_key=True)
    stock_id = Column(Integer, ForeignKey("stock_medios.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)
    observacion = Column(Text, nullable=True)

    stock = relationship("StockMedios", back_populates="aprobaciones")
    usuario = relationship("Usuario", back_populates="aprobaciones_medios")