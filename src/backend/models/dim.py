from datetime import date, datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class Sistema(Base):
    __tablename__ = "sistema"

    sistema_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    plantas = relationship("Planta", back_populates="sistema", cascade="all, delete-orphan")
    puntos_muestreo = relationship("PuntoMuestreo", back_populates="sistema", cascade="all, delete-orphan")

class Planta(Base):
    __tablename__ = "planta"

    planta_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    sistema_id = Column(Integer, ForeignKey("sistema.sistema_id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    sistema = relationship("Sistema", back_populates="plantas")
    areas = relationship("Area", back_populates="planta", cascade="all, delete-orphan")
    productos = relationship("Producto", back_populates="planta", cascade="all, delete-orphan")

class Area(Base):
    __tablename__ = "area"

    area_id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta.planta_id"), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    planta = relationship("Planta", back_populates="areas")
    equipos = relationship("EquipoInstrumento", back_populates="area", cascade="all, delete-orphan")
    puntos_muestreo = relationship("PuntoMuestreo", back_populates="area", cascade="all, delete-orphan")

class TipoEquipo(Base):
    __tablename__ = "tipo_equipo"

    tipo_equipo_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    equipos = relationship("EquipoInstrumento", back_populates="tipo_equipo")

class EstadoEquipo(Base):
    __tablename__ = "estado_equipo"

    estado_equipo_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    historicos = relationship("HistoricoEstadoEquipo", back_populates="estado_equipo")
    equipos = relationship("EquipoInstrumento", back_populates="estado")

class EquipoInstrumento(Base):
    __tablename__ = "equipo_instrumento"

    equipo_instrumento_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    tipo_equipo_id = Column(Integer, ForeignKey("tipo_equipo.tipo_equipo_id"), nullable=False)
    estado_equipo_id = Column(Integer, ForeignKey("estado_equipo.estado_equipo_id"), nullable=False)
    area_id = Column(Integer, ForeignKey("area.area_id"), nullable=False)

    tipo_equipo = relationship("TipoEquipo", back_populates="equipos")
    estado = relationship("EstadoEquipo", back_populates="equipos")
    area = relationship("Area", back_populates="equipos")
    zonas = relationship("ZonaEquipo", back_populates="equipo", cascade="all, delete-orphan")
    calibraciones = relationship("CalibracionCalificacionEquipo", back_populates="equipo", cascade="all, delete-orphan")
    historicos_estado = relationship("HistoricoEstadoEquipo", back_populates="equipo", cascade="all, delete-orphan")

class ZonaEquipo(Base):
    __tablename__ = "zona_equipo"

    zona_equipo_id = Column(Integer, primary_key=True)
    equipo_instrumento_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=False)
    nombre = Column(String, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    equipo = relationship("EquipoInstrumento", back_populates="zonas")

class CalibracionCalificacionEquipo(Base):
    __tablename__ = "calibracion_calificacion_equipo"

    calibracion_calificacion_equipo_id = Column(Integer, primary_key=True)
    tipo = Column(String, nullable=False)
    equipo_instrumento_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=False)
    fecha = Column(Date, nullable=False)
    vence = Column(Date, nullable=True)
    operario_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=False)

    equipo = relationship("EquipoInstrumento", back_populates="calibraciones")
    operario = relationship("Operario", primaryjoin="CalibracionCalificacionEquipo.operario_id==Operario.operario_id")

class HistoricoEstadoEquipo(Base):
    __tablename__ = "historico_estado_equipo"

    historico_estado_equipo_id = Column(Integer, primary_key=True)
    equipo_instrumento_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=False)
    estado_equipo_id = Column(Integer, ForeignKey("estado_equipo.estado_equipo_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)

    equipo = relationship("EquipoInstrumento", back_populates="historicos_estado")
    estado_equipo = relationship("EstadoEquipo", back_populates="historicos")
    usuario = relationship("Usuario", primaryjoin="HistoricoEstadoEquipo.usuario_id==Usuario.usuario_id")

class PuntoMuestreo(Base):
    __tablename__ = "punto_muestreo"

    punto_muestreo_id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    sistema_id = Column(Integer, ForeignKey("sistema.sistema_id"), nullable=True)
    area_id = Column(Integer, ForeignKey("area.area_id"), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    sistema = relationship("Sistema", back_populates="puntos_muestreo")
    area = relationship("Area", back_populates="puntos_muestreo")
