from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from src.backend.models.base import Base


class Documento(Base):
    __tablename__ = "documento"

    documento_id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    tipo_mime = Column(String(100), nullable=False)
    tamano_bytes = Column(Integer, nullable=False)
    ruta_archivo = Column(String(500), nullable=False)
    
    # Polymorphic association to link to any entity
    entidad_tipo = Column(String(50), nullable=False)  # ej: 'equipo', 'planta', 'orden_manufactura'
    entidad_id = Column(Integer, nullable=False)
    
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    fecha_subida = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    usuario = relationship("Usuario")

    # Composite index for quick lookups
    __table_args__ = (
        Index('idx_documento_entidad', 'entidad_tipo', 'entidad_id'),
    )

    def __repr__(self):
        return f"<Documento(id={self.documento_id}, nombre='{self.nombre}', entidad='{self.entidad_tipo}:{self.entidad_id}')>"
