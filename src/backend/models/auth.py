from datetime import date, datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, BigInteger, Date, DateTime, ForeignKey, Float, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class Usuario(Base):
    __tablename__ = "usuario"

    usuario_id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    firma = Column(String, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    roles = relationship("UsuarioRol", back_populates="usuario", cascade="all, delete-orphan")
    audit_trails = relationship("AuditTrail", back_populates="usuario")
    revisiones = relationship("Revision", back_populates="usuario")
    operario = relationship("Operario", back_populates="usuario", uselist=False)

class Rol(Base):
    __tablename__ = "rol"

    rol_id = Column(Integer, primary_key=True)
    nombre = Column(String, unique=True, nullable=False)

    usuarios = relationship("UsuarioRol", back_populates="rol", cascade="all, delete-orphan")

class UsuarioRol(Base):
    __tablename__ = "usuario_rol"

    usuario_rol_id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    rol_id = Column(Integer, ForeignKey("rol.rol_id"), nullable=False)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")

class AuditTrail(Base):
    __tablename__ = "audit_trail"

    audit_trail_id = Column(BigInteger, primary_key=True)
    tabla = Column(String, nullable=False)
    registro_id = Column(BigInteger, nullable=False)
    columna = Column(String, nullable=True)
    old_val = Column(Text, nullable=True)
    new_val = Column(Text, nullable=True)
    accion = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)

    usuario = relationship("Usuario", back_populates="audit_trails")

class Revision(Base):
    __tablename__ = "revision"

    revision_id = Column(Integer, primary_key=True)
    tabla = Column(String, nullable=False)
    registro_id = Column(BigInteger, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    conclusion = Column(String, nullable=False)

    usuario = relationship("Usuario", back_populates="revisiones")

class Operario(Base):
    __tablename__ = "operario"

    operario_id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    codigo_empleado = Column(String, unique=True, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    usuario = relationship("Usuario", back_populates="operario")
    # relationships to other modules will be defined below via string references
