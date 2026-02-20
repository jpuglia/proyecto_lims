# ./src/backend/models/all_models.py
# Este archivo contiene todas las clases juntas para referencia.
# En producción se recomienda separar cada clase en su archivo según las rutas comentadas
# antes de cada clase (tal como solicitaste).

from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float,
    ForeignKey, BigInteger, UniqueConstraint, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from src.backend.models.base import Base


# ./src/backend/models/dim_tables/sistema.py
class Sistema(Base):
    __tablename__ = "sistema"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    plantas = relationship("Planta", back_populates="sistema", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/planta.py
class Planta(Base):
    __tablename__ = "planta"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    sistema_id = Column(Integer, ForeignKey("sistema.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    sistema = relationship("Sistema", back_populates="plantas")
    areas = relationship("Area", back_populates="planta", cascade="all, delete-orphan")
    productos = relationship("Producto", back_populates="planta", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/area.py
class Area(Base):
    __tablename__ = "area"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", back_populates="areas")
    equipos = relationship("Equipo", back_populates="area", cascade="all, delete-orphan")
    puntos_muestreo = relationship("PuntoMuestreo", back_populates="area", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/estado_equipo.py
class EstadoEquipo(Base):
    __tablename__ = "estado_equipo"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    equipos = relationship("Equipo", back_populates="estado", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/equipo.py
class Equipo(Base):
    __tablename__ = "equipo"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    estado_id = Column(Integer, ForeignKey("estado_equipo.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=False)

    estado = relationship("EstadoEquipo", back_populates="equipos")
    area = relationship("Area", back_populates="equipos")
    incubaciones = relationship("Incubacion", back_populates="equipo", cascade="all, delete-orphan")


# ./src/backend/models/master/producto.py
class Producto(Base):
    __tablename__ = "producto"
    __table_args__ = (UniqueConstraint("codigo", name="uq_producto_codigo"),
                      UniqueConstraint("nombre", name="uq_producto_nombre"))

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", back_populates="productos")
    especificaciones = relationship("Especificacion", back_populates="producto", cascade="all, delete-orphan")
    recepciones = relationship("Recepcion", back_populates="producto", cascade="all, delete-orphan")


# ./src/backend/models/master/especificacion.py
class Especificacion(Base):
    __tablename__ = "especificacion"

    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("producto.id"), nullable=False)
    parametro = Column(String, nullable=False)
    tipo_limite = Column(String, nullable=True)
    valor_min = Column(Float, nullable=True)
    valor_max = Column(Float, nullable=True)
    unidad = Column(String, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    producto = relationship("Producto", back_populates="especificaciones")
    resultado_detalles = relationship("ResultadoDetalle", back_populates="especificacion", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/punto_muestreo.py
class PuntoMuestreo(Base):
    __tablename__ = "punto_muestreo"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    area_id = Column(Integer, ForeignKey("area.id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    area = relationship("Area", back_populates="puntos_muestreo")
    recepciones = relationship("Recepcion", back_populates="punto_muestreo", cascade="all, delete-orphan")


# ./src/backend/models/master/metodo_version.py
class MetodoVersion(Base):
    __tablename__ = "metodo_version"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=True)
    nombre = Column(String, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    analisis = relationship("Analisis", back_populates="metodo", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/estado_recepcion.py
class EstadoRecepcion(Base):
    __tablename__ = "estado_recepcion"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    recepciones = relationship("Recepcion", back_populates="estado", cascade="all, delete-orphan")


# ./src/backend/models/fact/recepcion.py
class Recepcion(Base):
    __tablename__ = "recepcion"

    id = Column(Integer, primary_key=True)
    num_analisis = Column(String, unique=True, nullable=False)
    fecha = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    punto_muestreo_id = Column(Integer, ForeignKey("punto_muestreo.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("producto.id"), nullable=False)
    estado_id = Column(Integer, ForeignKey("estado_recepcion.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    punto_muestreo = relationship("PuntoMuestreo", back_populates="recepciones")
    producto = relationship("Producto", back_populates="recepciones")
    estado = relationship("EstadoRecepcion", back_populates="recepciones")
    usuario = relationship("Usuario", back_populates="recepciones")
    analisis = relationship("Analisis", back_populates="recepcion", cascade="all, delete-orphan")


# ./src/backend/models/dim_tables/estado_analisis.py
class EstadoAnalisis(Base):
    __tablename__ = "estado_analisis"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    analisis = relationship("Analisis", back_populates="estado", cascade="all, delete-orphan")
    historial_estados = relationship("HistorialEstadoAnalisis", back_populates="estado", cascade="all, delete-orphan")


# ./src/backend/models/fact/analisis.py
class Analisis(Base):
    __tablename__ = "analisis"

    id = Column(Integer, primary_key=True)
    recepcion_id = Column(Integer, ForeignKey("recepcion.id"), nullable=False)
    metodo_version_id = Column(Integer, ForeignKey("metodo_version.id"), nullable=False)
    estado_id = Column(Integer, ForeignKey("estado_analisis.id"), nullable=False)
    fecha_inicio = Column(Date, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    recepcion = relationship("Recepcion", back_populates="analisis")
    metodo = relationship("MetodoVersion", back_populates="analisis")
    estado = relationship("EstadoAnalisis", back_populates="analisis")
    usuario = relationship("Usuario", back_populates="analisis_ejecutado")
    historial_estados = relationship("HistorialEstadoAnalisis", back_populates="analisis", cascade="all, delete-orphan")

    incubaciones = relationship("Incubacion", back_populates="analisis", cascade="all, delete-orphan")
    resultados = relationship("Resultado", back_populates="analisis", cascade="all, delete-orphan")
    uso_medios = relationship("UsoMedios", back_populates="analisis", cascade="all, delete-orphan")
    uso_cepas = relationship("UsoCepa", back_populates="analisis", cascade="all, delete-orphan")


# ./src/backend/models/fact/historial_estado_analisis.py
class HistorialEstadoAnalisis(Base):
    __tablename__ = "historial_estado_analisis"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    estado_id = Column(Integer, ForeignKey("estado_analisis.id"), nullable=False)
    fecha = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    analisis = relationship("Analisis", back_populates="historial_estados")
    estado = relationship("EstadoAnalisis", back_populates="historial_estados")
    usuario = relationship("Usuario", back_populates="historial_estados")


# ./src/backend/models/fact/incubacion.py
class Incubacion(Base):
    __tablename__ = "incubacion"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    equipo_id = Column(Integer, ForeignKey("equipo.id"), nullable=False)
    entrada = Column(DateTime, nullable=True)
    salida = Column(DateTime, nullable=True)
    temp_registrada = Column(Float, nullable=True)
    unidad_temp = Column(String, nullable=True)

    analisis = relationship("Analisis", back_populates="incubaciones")
    equipo = relationship("Equipo", back_populates="incubaciones")


# ./src/backend/models/fact/resultado.py
class Resultado(Base):
    __tablename__ = "resultado"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    fecha_reporte = Column(DateTime, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    analisis = relationship("Analisis", back_populates="resultados")
    usuario = relationship("Usuario", back_populates="resultados_reportados")
    detalles = relationship("ResultadoDetalle", back_populates="resultado", cascade="all, delete-orphan")


# ./src/backend/models/fact/resultado_detalle.py
class ResultadoDetalle(Base):
    __tablename__ = "resultado_detalle"

    id = Column(Integer, primary_key=True)
    resultado_id = Column(Integer, ForeignKey("resultado.id"), nullable=False)
    especificacion_id = Column(Integer, ForeignKey("especificacion.id"), nullable=False)
    valor_obtenido = Column(Float, nullable=True)
    cumple = Column(Boolean, nullable=True)

    resultado = relationship("Resultado", back_populates="detalles")
    especificacion = relationship("Especificacion", back_populates="resultado_detalles")


# ./src/backend/models/inventory/medio_preparado.py
class MedioPreparado(Base):
    __tablename__ = "medio_preparado"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    ordenes_preparacion = relationship("OrdenPreparacionMedio", back_populates="medio", cascade="all, delete-orphan")


from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
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


# ./src/backend/models/inventory/uso_polvo_suplemento.py
class UsoPolvoSuplemento(Base):
    __tablename__ = "uso_polvo_suplemento"

    id = Column(Integer, primary_key=True)
    polvo_id = Column(Integer, ForeignKey("polvo_suplemento.id"), nullable=False)
    orden_id = Column(Integer, ForeignKey("orden_preparacion_medio.id"), nullable=False)
    cantidad = Column(Float, nullable=True)
    unidad = Column(String, nullable=True)

    polvo = relationship("PolvoSuplemento", back_populates="usos")
    orden = relationship("OrdenPreparacionMedio", back_populates="usos_polvo")


# ./src/backend/models/dim_tables/estado_qc.py
class EstadoQC(Base):
    __tablename__ = "estado_qc"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    stock_medios = relationship("StockMedios", back_populates="estado_qc", cascade="all, delete-orphan")



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


# ./src/backend/models/fact/uso_medios.py
class UsoMedios(Base):
    __tablename__ = "uso_medios"

    id = Column(Integer, primary_key=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stock_medios.id"), nullable=False)

    analisis = relationship("Analisis", back_populates="uso_medios")
    stock = relationship("StockMedios", back_populates="usos_medios")


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


# ./src/backend/models/fact/uso_cepa.py
class UsoCepa(Base):
    __tablename__ = "uso_cepa"

    id = Column(Integer, primary_key=True)
    cepa_id = Column(Integer, ForeignKey("cepa_referencia.id"), nullable=False)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)

    cepa = relationship("CepaReferencia", back_populates="usos_cepa")
    analisis = relationship("Analisis", back_populates="uso_cepas")


# ./src/backend/models/auth/usuario.py
class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    firma = Column(String, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    roles = relationship("UsuarioRol", back_populates="usuario", cascade="all, delete-orphan")
    recepciones = relationship("Recepcion", back_populates="usuario", cascade="all, delete-orphan")
    analisis_ejecutado = relationship("Analisis", back_populates="usuario", cascade="all, delete-orphan")
    resultados_reportados = relationship("Resultado", back_populates="usuario", cascade="all, delete-orphan")
    ordenes_preparacion = relationship("OrdenPreparacionMedio", back_populates="usuario", cascade="all, delete-orphan")
    aprobaciones_medios = relationship("AprobacionMedios", back_populates="usuario", cascade="all, delete-orphan")
    historial_estados = relationship("HistorialEstadoAnalisis", back_populates="usuario", cascade="all, delete-orphan")
    audit_trails = relationship("AuditTrail", back_populates="usuario", cascade="all, delete-orphan")
    revisiones = relationship("Revision", back_populates="usuario", cascade="all, delete-orphan")


# ./src/backend/models/auth/rol.py
class Rol(Base):
    __tablename__ = "rol"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    usuarios = relationship("UsuarioRol", back_populates="rol", cascade="all, delete-orphan")



