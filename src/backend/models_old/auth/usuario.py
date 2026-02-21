from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship, mapped_column, Mapped

from models.base import Base

# ./src/backend/models/auth/usuario.py
class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    firma = Column(String, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean)

    roles = relationship("UsuarioRol", back_populates="usuario", cascade="all, delete-orphan")
    recepciones = relationship("Recepcion", back_populates="usuario", cascade="all, delete-orphan")
    analisis_ejecutado = relationship("Analisis", back_populates="usuario", cascade="all, delete-orphan")
    resultados_reportados = relationship("Resultado", back_populates="usuario", cascade="all, delete-orphan")
    ordenes_preparacion = relationship("OrdenPreparacionMedio", back_populates="usuario", cascade="all, delete-orphan")
    aprobaciones_medios = relationship("AprobacionMedios", back_populates="usuario", cascade="all, delete-orphan")
    historial_estados = relationship("HistorialEstadoAnalisis", back_populates="usuario", cascade="all, delete-orphan")
    audit_trails = relationship("AuditTrail", back_populates="usuario", cascade="all, delete-orphan")
    revisiones = relationship("Revision", back_populates="usuario", cascade="all, delete-orphan")
    incubaciones_entrada = relationship("Incubacion", foreign_keys="Incubacion.usuario_entrada_id", back_populates=None)
    incubaciones_salida = relationship("Incubacion", foreign_keys="Incubacion.usuario_salida_id", back_populates=None)
