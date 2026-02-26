"""Pydantic schemas for master module (products, specs, methods, cepas)."""
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─── Producto ─────────────────────────────────────────────────

class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    planta_id: int
    activo: bool = True

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    activo: Optional[bool] = None

class ProductoResponse(ProductoBase):
    producto_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Especificacion ──────────────────────────────────────────

class EspecificacionBase(BaseModel):
    producto_id: int
    parametro: str
    tipo_limite: str
    valor_min: Optional[float] = None
    valor_max: Optional[float] = None
    unidad: Optional[str] = None
    activo: bool = True

class EspecificacionCreate(EspecificacionBase):
    pass

class EspecificacionResponse(EspecificacionBase):
    especificacion_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── MetodoVersion ───────────────────────────────────────────

class MetodoVersionBase(BaseModel):
    codigo: Optional[str] = None
    nombre: str
    version: int = 1
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class MetodoVersionCreate(MetodoVersionBase):
    pass

class MetodoVersionResponse(MetodoVersionBase):
    metodo_version_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── CepaReferencia ──────────────────────────────────────────

class CepaReferenciaBase(BaseModel):
    codigo_atcc: str
    lote: Optional[str] = None
    pase: Optional[int] = None
    fecha_control: Optional[date] = None
    estado_biologico: Optional[str] = None

class CepaReferenciaCreate(CepaReferenciaBase):
    pass

class CepaReferenciaResponse(CepaReferenciaBase):
    cepa_referencia_id: int
    model_config = ConfigDict(from_attributes=True)
