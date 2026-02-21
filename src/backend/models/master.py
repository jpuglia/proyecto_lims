from datetime import date
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class Producto(Base):
    __tablename__ = "producto"
    __table_args__ = (UniqueConstraint("codigo", name="uq_producto_codigo"),
                      UniqueConstraint("nombre", name="uq_producto_nombre"))

    producto_id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.planta_id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", primaryjoin="Producto.planta_id==Planta.planta_id")
    especificaciones = relationship("Especificacion", back_populates="producto", cascade="all, delete-orphan")

class Especificacion(Base):
    __tablename__ = "especificacion"

    especificacion_id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("producto.producto_id"), nullable=False)
    parametro = Column(String, nullable=False)
    tipo_limite = Column(String, nullable=False)
    valor_min = Column(Float, nullable=True)
    valor_max = Column(Float, nullable=True)
    unidad = Column(String, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    producto = relationship("Producto", back_populates="especificaciones")

class MetodoVersion(Base):
    __tablename__ = "metodo_version"

    metodo_version_id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=True)
    nombre = Column(String, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

class CepaReferencia(Base):
    __tablename__ = "cepa_referencia"

    cepa_referencia_id = Column(Integer, primary_key=True)
    codigo_atcc = Column(String, unique=True, nullable=False)
    lote = Column(String, nullable=True)
    pase = Column(Integer, nullable=True)
    fecha_control = Column(Date, nullable=True)
    estado_biologico = Column(String, nullable=True)
