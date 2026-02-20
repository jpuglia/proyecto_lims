from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from models.base import Base

# ./src/backend/models/fact/recepcion.py
class Recepcion(Base):
    __tablename__ = "recepcion"

    id = Column(Integer, primary_key=True)

    tipo = Column(String, nullable=False)
    # "SERVICIO" | "PRODUCTO" | "HISOPO"

    fecha = Column(DateTime, nullable=False, default = datetime.now(timezone.utc))

    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=False)

    decision = Column(String, nullable=True)

    servicio = relationship("RecepcionServicio", uselist=False, back_populates="recepcion")
    producto = relationship("RecepcionProducto", uselist=False, back_populates="recepcion")
    hisopo = relationship("RecepcionHisopo", uselist=False, back_populates="recepcion")

    estado_id = Column(
        Integer,
        ForeignKey("estado_recepcion.id", ondelete="RESTRICT"),
        nullable=False
    )

    estado = relationship(
        "EstadoRecepcion",
        back_populates="recepciones"
    )

