from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship

from models.base import Base

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