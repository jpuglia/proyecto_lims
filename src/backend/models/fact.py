from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class EstadoManufactura(Base):
    __tablename__ = "estado_manufactura"

    estado_manufactura_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

class OrdenManufactura(Base):
    __tablename__ = "orden_manufactura"

    orden_manufactura_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    lote = Column(String, nullable=False)
    fecha = Column(Date, nullable=False)
    producto_id = Column(Integer, ForeignKey("producto.producto_id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    producto = relationship("Producto", primaryjoin="OrdenManufactura.producto_id==Producto.producto_id")
    operario = relationship("Operario", primaryjoin="OrdenManufactura.operario_id==Operario.operario_id")
    manufacturas = relationship("Manufactura", back_populates="orden", cascade="all, delete-orphan")

class Manufactura(Base):
    __tablename__ = "manufactura"

    manufactura_id = Column(Integer, primary_key=True)
    orden_manufactura_id = Column(Integer, ForeignKey("orden_manufactura.orden_manufactura_id"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    estado_manufactura_id = Column(Integer, ForeignKey("estado_manufactura.estado_manufactura_id"), nullable=False)
    observacion = Column(Text, nullable=True)

    orden = relationship("OrdenManufactura", back_populates="manufacturas")
    estado = relationship("EstadoManufactura", primaryjoin="Manufactura.estado_manufactura_id==EstadoManufactura.estado_manufactura_id")

class ManufacturaOperario(Base):
    __tablename__ = "manufactura_operario"

    manufactura_operario_id = Column(Integer, primary_key=True)
    manufactura_id = Column(Integer, ForeignKey("manufactura.manufactura_id"), nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)
    entrada = Column(DateTime, nullable=True)
    salida = Column(DateTime, nullable=True)
    rol_operacion = Column(String, nullable=True)

    manufactura = relationship("Manufactura", primaryjoin="ManufacturaOperario.manufactura_id==Manufactura.manufactura_id")
    operario = relationship("Operario", primaryjoin="ManufacturaOperario.operario_id==Operario.operario_id")

class HistoricoEstadoManufactura(Base):
    __tablename__ = "historico_estado_manufactura"

    historico_estado_manufactura_id = Column(Integer, primary_key=True)
    manufactura_id = Column(Integer, ForeignKey("manufactura.manufactura_id"), nullable=False)
    estado_manufactura_id = Column(Integer, ForeignKey("estado_manufactura.estado_manufactura_id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    manufactura = relationship("Manufactura", primaryjoin="HistoricoEstadoManufactura.manufactura_id==Manufactura.manufactura_id")
    estado_manufactura = relationship("EstadoManufactura", primaryjoin="HistoricoEstadoManufactura.estado_manufactura_id==EstadoManufactura.estado_manufactura_id")
    usuario = relationship("Usuario", primaryjoin="HistoricoEstadoManufactura.usuario_id==Usuario.usuario_id")

class EstadoSolicitud(Base):
    __tablename__ = "estado_solicitud"

    estado_solicitud_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

class SolicitudMuestreo(Base):
    __tablename__ = "solicitud_muestreo"

    solicitud_muestreo_id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    tipo = Column(String, nullable=False)
    orden_manufactura_id = Column(Integer, ForeignKey("orden_manufactura.orden_manufactura_id"), nullable=True)
    equipo_instrumento_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=True)
    punto_muestreo_id = Column(Integer, ForeignKey("punto_muestreo.punto_muestreo_id"), nullable=True)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=True)
    estado_solicitud_id = Column(Integer, ForeignKey("estado_solicitud.estado_solicitud_id"), nullable=False)
    observacion = Column(Text, nullable=True)

    usuario = relationship("Usuario", primaryjoin="SolicitudMuestreo.usuario_id==Usuario.usuario_id")
    orden_manufactura = relationship("OrdenManufactura", primaryjoin="SolicitudMuestreo.orden_manufactura_id==OrdenManufactura.orden_manufactura_id")
    equipo_instrumento = relationship("EquipoInstrumento", primaryjoin="SolicitudMuestreo.equipo_instrumento_id==EquipoInstrumento.equipo_instrumento_id")
    punto_muestreo = relationship("PuntoMuestreo", primaryjoin="SolicitudMuestreo.punto_muestreo_id==PuntoMuestreo.punto_muestreo_id")
    operario = relationship("Operario", primaryjoin="SolicitudMuestreo.operario_id==Operario.operario_id")
    estado_solicitud = relationship("EstadoSolicitud", primaryjoin="SolicitudMuestreo.estado_solicitud_id==EstadoSolicitud.estado_solicitud_id")

class HistoricoSolicitudMuestreo(Base):
    __tablename__ = "historico_solicitud_muestreo"

    historico_solicitud_muestreo_id = Column(Integer, primary_key=True)
    solicitud_muestreo_id = Column(Integer, ForeignKey("solicitud_muestreo.solicitud_muestreo_id"), nullable=False)
    estado_solicitud_id = Column(Integer, ForeignKey("estado_solicitud.estado_solicitud_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    observacion = Column(Text, nullable=True)

    solicitud_muestreo = relationship("SolicitudMuestreo", primaryjoin="HistoricoSolicitudMuestreo.solicitud_muestreo_id==SolicitudMuestreo.solicitud_muestreo_id")
    estado_solicitud = relationship("EstadoSolicitud", primaryjoin="HistoricoSolicitudMuestreo.estado_solicitud_id==EstadoSolicitud.estado_solicitud_id")
    usuario = relationship("Usuario", primaryjoin="HistoricoSolicitudMuestreo.usuario_id==Usuario.usuario_id")

class Muestreo(Base):
    __tablename__ = "muestreo"

    muestreo_id = Column(Integer, primary_key=True)
    solicitud_muestreo_id = Column(Integer, ForeignKey("solicitud_muestreo.solicitud_muestreo_id"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    muestras = relationship("Muestra", back_populates="muestreo", cascade="all, delete-orphan")

class Muestra(Base):
    __tablename__ = "muestra"

    muestra_id = Column(Integer, primary_key=True)
    muestreo_id = Column(Integer, ForeignKey("muestreo.muestreo_id"), nullable=False)
    punto_muestreo_id = Column(Integer, ForeignKey("punto_muestreo.punto_muestreo_id"), nullable=True)
    zona_equipo_id = Column(Integer, ForeignKey("zona_equipo.zona_equipo_id"), nullable=True)
    operario_muestreado_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=True)
    tipo_muestra = Column(String, nullable=False)
    codigo_etiqueta = Column(String, unique=True, nullable=False)
    observacion = Column(Text, nullable=True)

    muestreo = relationship("Muestreo", back_populates="muestras")

class EnvioMuestra(Base):
    __tablename__ = "envio_muestra"

    envio_muestra_id = Column(Integer, primary_key=True)
    muestra_id = Column(Integer, ForeignKey("muestra.muestra_id"), nullable=False)
    fecha = Column(DateTime, nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)
    destino = Column(String, nullable=False)

    muestra = relationship("Muestra", primaryjoin="EnvioMuestra.muestra_id==Muestra.muestra_id")

class Recepcion(Base):
    __tablename__ = "recepcion"

    recepcion_id = Column(Integer, primary_key=True)
    envio_muestra_id = Column(Integer, ForeignKey("envio_muestra.envio_muestra_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)
    recibido_en = Column(String, nullable=False)
    decision = Column(String, nullable=False)
    observacion = Column(Text, nullable=True)

    envio_muestra = relationship("EnvioMuestra", primaryjoin="Recepcion.envio_muestra_id==EnvioMuestra.envio_muestra_id")
    operario = relationship("Operario", primaryjoin="Recepcion.operario_id==Operario.operario_id")

class EstadoAnalisis(Base):
    __tablename__ = "estado_analisis"

    estado_analisis_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

class Analisis(Base):
    __tablename__ = "analisis"

    analisis_id = Column(Integer, primary_key=True)
    muestra_id = Column(Integer, ForeignKey("muestra.muestra_id"), nullable=False)
    recepcion_id = Column(Integer, ForeignKey("recepcion.recepcion_id"), nullable=False)
    metodo_version_id = Column(Integer, ForeignKey("metodo_version.metodo_version_id"), nullable=False)
    especificacion_id = Column(Integer, ForeignKey("especificacion.especificacion_id"), nullable=True)
    estado_analisis_id = Column(Integer, ForeignKey("estado_analisis.estado_analisis_id"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    ultimo_cambio = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    muestra = relationship("Muestra", primaryjoin="Analisis.muestra_id==Muestra.muestra_id")
    recepcion = relationship("Recepcion", primaryjoin="Analisis.recepcion_id==Recepcion.recepcion_id")
    metodo_version = relationship("MetodoVersion", primaryjoin="Analisis.metodo_version_id==MetodoVersion.metodo_version_id")
    especificacion = relationship("Especificacion", primaryjoin="Analisis.especificacion_id==Especificacion.especificacion_id")
    estado_analisis = relationship("EstadoAnalisis", primaryjoin="Analisis.estado_analisis_id==EstadoAnalisis.estado_analisis_id")
    operario = relationship("Operario", primaryjoin="Analisis.operario_id==Operario.operario_id")

class HistorialEstadoAnalisis(Base):
    __tablename__ = "historial_estado_analisis"

    historial_estado_analisis_id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.analisis_id"), nullable=False)
    estado_analisis_id = Column(Integer, ForeignKey("estado_analisis.estado_analisis_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    analisis = relationship("Analisis", primaryjoin="HistorialEstadoAnalisis.analisis_id==Analisis.analisis_id")
    estado_analisis = relationship("EstadoAnalisis", primaryjoin="HistorialEstadoAnalisis.estado_analisis_id==EstadoAnalisis.estado_analisis_id")
    operario = relationship("Operario", primaryjoin="HistorialEstadoAnalisis.operario_id==Operario.operario_id")

class Incubacion(Base):
    __tablename__ = "incubacion"

    incubacion_id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.analisis_id"), nullable=False)
    equipo_instrumento_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=False)
    entrada = Column(DateTime, nullable=True)
    salida = Column(DateTime, nullable=True)
    temp_registrada = Column(Float, nullable=True)
    unidad_temp = Column(String, nullable=True)

    analisis = relationship("Analisis", primaryjoin="Incubacion.analisis_id==Analisis.analisis_id")
    equipo_instrumento = relationship("EquipoInstrumento", primaryjoin="Incubacion.equipo_instrumento_id==EquipoInstrumento.equipo_instrumento_id")

class Resultado(Base):
    __tablename__ = "resultado"

    resultado_id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.analisis_id"), nullable=False)
    fecha_reporte = Column(DateTime, nullable=True)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)
    valor = Column(String, nullable=True)
    valor_numerico = Column(Float, nullable=True)
    unidad = Column(String, nullable=True)
    conforme = Column(Boolean, nullable=True)
    observacion = Column(Text, nullable=True)

    analisis = relationship("Analisis", primaryjoin="Resultado.analisis_id==Analisis.analisis_id")
    operario = relationship("Operario", primaryjoin="Resultado.operario_id==Operario.operario_id")
