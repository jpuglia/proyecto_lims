from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentoBase(BaseModel):
    nombre: str
    tipo_mime: str
    tamano_bytes: int
    entidad_tipo: str
    entidad_id: int


class DocumentoCreate(DocumentoBase):
    ruta_archivo: str
    usuario_id: int


class DocumentoResponse(DocumentoBase):
    documento_id: int
    usuario_id: int
    fecha_subida: datetime

    model_config = ConfigDict(from_attributes=True)
