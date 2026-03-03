from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from datetime import datetime, timezone
from src.backend.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_log_id = Column(Integer, primary_key=True, autoincrement=True)
    tabla_nombre = Column(String(100), nullable=False)
    registro_id = Column(Integer, nullable=False)
    operacion = Column(String(20), nullable=False) # INSERT, UPDATE, DELETE
    valor_anterior = Column(JSON, nullable=True)
    valor_nuevo = Column(JSON, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<AuditLog(tabla={self.tabla_nombre}, id={self.registro_id}, op={self.operacion})>"
