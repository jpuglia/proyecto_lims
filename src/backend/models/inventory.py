from datetime import date, datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class PolvoSuplemento(Base):
    __tablename__ = "polvo_suplemento"

    polvo_suplemento_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    unidad = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

class RecepcionPolvoSuplemento(Base):
    __tablename__ = "recepcion_polvo_suplemento"

    recepcion_polvo_suplemento_id = Column(Integer, primary_key=True)
    polvo_suplemento_id = Column(Integer, ForeignKey("polvo_suplemento.polvo_suplemento_id"), nullable=False)
    lote_proveedor = Column(String, nullable=False)
    vence = Column(Date, nullable=False)
    cantidad = Column(Float, nullable=False)

    polvo_suplemento = relationship("PolvoSuplemento", primaryjoin="RecepcionPolvoSuplemento.polvo_suplemento_id==PolvoSuplemento.polvo_suplemento_id")

class StockPolvoSuplemento(Base):
    __tablename__ = "stock_polvo_suplemento"

    stock_polvo_suplemento_id = Column(Integer, primary_key=True)
    recepcion_polvo_suplemento_id = Column(Integer, ForeignKey("recepcion_polvo_suplemento.recepcion_polvo_suplemento_id"), nullable=False)
    cantidad = Column(Float, nullable=False)

    recepcion = relationship("RecepcionPolvoSuplemento", primaryjoin="StockPolvoSuplemento.recepcion_polvo_suplemento_id==RecepcionPolvoSuplemento.recepcion_polvo_suplemento_id")

class MedioPreparado(Base):
    __tablename__ = "medio_preparado"

    medio_preparado_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

class OrdenPreparacionMedio(Base):
    __tablename__ = "orden_preparacion_medio"

    orden_preparacion_medio_id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    medio_preparado_id = Column(Integer, ForeignKey("medio_preparado.medio_preparado_id"), nullable=False)
    lote = Column(String, nullable=False)
    volumen_total = Column(Float, nullable=False)
    unidad_volumen = Column(String, nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    medio_preparado = relationship("MedioPreparado", primaryjoin="OrdenPreparacionMedio.medio_preparado_id==MedioPreparado.medio_preparado_id")
    operario = relationship("Operario", primaryjoin="OrdenPreparacionMedio.operario_id==Operario.operario_id")

class UsoPolvoSuplemento(Base):
    __tablename__ = "uso_polvo_suplemento"

    uso_polvo_suplemento_id = Column(Integer, primary_key=True)
    stock_polvo_suplemento_id = Column(Integer, ForeignKey("stock_polvo_suplemento.stock_polvo_suplemento_id"), nullable=False)
    orden_preparacion_medio_id = Column(Integer, ForeignKey("orden_preparacion_medio.orden_preparacion_medio_id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)

    stock_polvo = relationship("StockPolvoSuplemento", primaryjoin="UsoPolvoSuplemento.stock_polvo_suplemento_id==StockPolvoSuplemento.stock_polvo_suplemento_id")
    orden_preparacion_medio = relationship("OrdenPreparacionMedio", primaryjoin="UsoPolvoSuplemento.orden_preparacion_medio_id==OrdenPreparacionMedio.orden_preparacion_medio_id")

class EstadoQC(Base):
    __tablename__ = "estado_qc"

    estado_qc_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

class StockMedios(Base):
    __tablename__ = "stock_medios"

    stock_medios_id = Column(Integer, primary_key=True)
    orden_preparacion_medio_id = Column(Integer, ForeignKey("orden_preparacion_medio.orden_preparacion_medio_id"), nullable=False)
    lote_interno = Column(String, nullable=False)
    vence = Column(Date, nullable=False)
    estado_qc_id = Column(Integer, ForeignKey("estado_qc.estado_qc_id"), nullable=False)

    orden_preparacion_medio = relationship("OrdenPreparacionMedio", primaryjoin="StockMedios.orden_preparacion_medio_id==OrdenPreparacionMedio.orden_preparacion_medio_id")
    estado_qc = relationship("EstadoQC", primaryjoin="StockMedios.estado_qc_id==EstadoQC.estado_qc_id")

class AprobacionMedios(Base):
    __tablename__ = "aprobacion_medios"

    aprobacion_medios_id = Column(Integer, primary_key=True)
    stock_medios_id = Column(Integer, ForeignKey("stock_medios.stock_medios_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)
    observacion = Column(Text, nullable=True)

    stock_medios = relationship("StockMedios", primaryjoin="AprobacionMedios.stock_medios_id==StockMedios.stock_medios_id")
    operario = relationship("Operario", primaryjoin="AprobacionMedios.operario_id==Operario.operario_id")

class UsoMedios(Base):
    __tablename__ = "uso_medios"

    uso_medios_id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.analisis_id"), nullable=False)
    stock_medios_id = Column(Integer, ForeignKey("stock_medios.stock_medios_id"), nullable=False)

    analisis = relationship("Analisis", primaryjoin="UsoMedios.analisis_id==Analisis.analisis_id")
    stock_medios = relationship("StockMedios", primaryjoin="UsoMedios.stock_medios_id==StockMedios.stock_medios_id")

class UsoCepa(Base):
    __tablename__ = "uso_cepa"

    uso_cepa_id = Column(Integer, primary_key=True)
    cepa_referencia_id = Column(Integer, ForeignKey("cepa_referencia.cepa_referencia_id"), nullable=False)
    analisis_id = Column(Integer, ForeignKey("analisis.analisis_id"), nullable=False)

    cepa_referencia = relationship("CepaReferencia", primaryjoin="UsoCepa.cepa_referencia_id==CepaReferencia.cepa_referencia_id")
    analisis = relationship("Analisis", primaryjoin="UsoCepa.analisis_id==Analisis.analisis_id")

