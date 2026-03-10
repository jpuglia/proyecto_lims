import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship

from src.backend.models.base import Base

class Sampling(Base):
    """
    Entidad que maneja los registros de muestreo realizados por inspectores.
    Puede estar vinculada a una solicitud previa o ser ad-hoc.
    """
    __tablename__ = "samplings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspector_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    request_id = Column(Integer, ForeignKey("solicitud_muestreo.solicitud_muestreo_id"), nullable=True)
    
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    
    # Condicionales: producto/lote O punto de muestreo
    product_id = Column(Integer, ForeignKey("producto.producto_id"), nullable=True)
    lot_id = Column(Integer, ForeignKey("orden_manufactura.orden_manufactura_id"), nullable=True)
    lot_number = Column(String(100), nullable=True)
    sampling_point_id = Column(Integer, ForeignKey("punto_muestreo.punto_muestreo_id"), nullable=True)
    
    # Requerido solo si product_id está poblado (validación en lógica de negocio/schema)
    extracted_quantity = Column(Numeric(precision=10, scale=2), nullable=True)
    
    # Nuevos campos para ad-hoc (tipo de muestra y detalles de hisopado)
    sample_type = Column(String(100), nullable=True)
    equipo_id = Column(Integer, ForeignKey("equipo_instrumento.equipo_instrumento_id"), nullable=True)
    operario_muestreado_id = Column(Integer, ForeignKey("operario.operario_id"), nullable=True)
    area_id = Column(Integer, ForeignKey("area.area_id"), nullable=True)
    region_swabbed = Column(String(255), nullable=True)
    tyvek_wash_number = Column(Integer, nullable=True) # Nro. lavado del tyvek

    destination = Column(String(100), nullable=False)
    
    # Workflow Auditoría
    status = Column(String(50), nullable=False, default="PENDING_REVIEW") # PENDING_REVIEW, PENDING_SUBMISSION, SUBMITTED
    reviewer_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=True)
    review_timestamp = Column(DateTime, nullable=True)
    
    submission_id = Column(String(36), nullable=True) # UUID for batching
    submission_timestamp = Column(DateTime, nullable=True)
    
    batch_id = Column(String(36), nullable=True) # ID for grouping samplings created together
    
    # Relaciones
    inspector = relationship("Usuario", foreign_keys=[inspector_id])
    reviewer = relationship("Usuario", foreign_keys=[reviewer_id])
    request = relationship("SolicitudMuestreo", foreign_keys=[request_id])
    product = relationship("Producto", foreign_keys=[product_id])
    lot = relationship("OrdenManufactura", foreign_keys=[lot_id])
    sampling_point = relationship("PuntoMuestreo", foreign_keys=[sampling_point_id])
    equipo = relationship("EquipoInstrumento", foreign_keys=[equipo_id])
    operario_muestreado = relationship("Operario", foreign_keys=[operario_muestreado_id])
    area = relationship("Area", foreign_keys=[area_id])
