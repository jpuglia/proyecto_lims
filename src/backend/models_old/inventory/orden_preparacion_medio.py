from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship

from models.base import Base

# ./src/backend/models/inventory/orden_preparacion_medio.py
class OrdenPreparacionMedio(Base):
    __tablename__ = "orden_preparacion_medio"

    id = Column(Integer, primary_key=True)
    fecha = Column(Date, nullable=False)
    medio_preparado_id = Column(Integer, ForeignKey("medio_preparado.id"), nullable=False)
    volumen_total = Column(Float, nullable=True)
    unidad_volumen = Column(String, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    medio = relationship("MedioPreparado", back_populates="ordenes_preparacion")
    usuario = relationship("Usuario", back_populates="ordenes_preparacion")
    usos_polvo = relationship("UsoPolvoSuplemento", back_populates="orden", cascade="all, delete-orphan")
    stock_medios = relationship("StockMedios", back_populates="orden", cascade="all, delete-orphan")