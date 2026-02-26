"""Pydantic schemas for master module (products, specs, methods, cepas)."""
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Producto ─────────────────────────────────────────────────

class ProductoBase(BaseModel):
    codigo: str = Field(..., description="Código interno del producto (SAP/ERP)", json_schema_extra={"example": "PROD-001"})
    nombre: str = Field(..., description="Nombre comercial del producto", json_schema_extra={"example": "Ibuprofeno 400mg"})
    planta_id: int = Field(..., description="ID de la planta de manufactura", json_schema_extra={"example": 1})
    activo: bool = Field(True, description="Si el producto está vigente")

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
    producto_id: int = Field(..., description="ID del producto asociado")
    parametro: str = Field(..., description="Nombre del parámetro (ej. Pureza, pH)", json_schema_extra={"example": "pH"})
    tipo_limite: str = Field(..., description="Tipo de límite (Rango, Min, Max, Texto)", json_schema_extra={"example": "Rango"})
    valor_min: Optional[float] = Field(None, description="Valor mínimo aceptable")
    valor_max: Optional[float] = Field(None, description="Valor máximo aceptable")
    unidad: Optional[str] = Field(None, description="Unidad de medida", json_schema_extra={"example": "mg"})
    activo: bool = Field(True, description="Estado de la especificación")

class EspecificacionCreate(EspecificacionBase):
    pass

class EspecificacionResponse(EspecificacionBase):
    especificacion_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── MetodoVersion ───────────────────────────────────────────

class MetodoVersionBase(BaseModel):
    codigo: Optional[str] = Field(None, description="Código del método analítico")
    nombre: str = Field(..., description="Nombre del método", json_schema_extra={"example": "Recuento en placa"})
    version: int = Field(1, description="Versión del método")
    fecha_inicio: Optional[date] = Field(None, description="Fecha de vigencia inicial")
    fecha_fin: Optional[date] = Field(None, description="Fecha de vigencia final")

class MetodoVersionCreate(MetodoVersionBase):
    pass

class MetodoVersionResponse(MetodoVersionBase):
    metodo_version_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── CepaReferencia ──────────────────────────────────────────

class CepaReferenciaBase(BaseModel):
    codigo_atcc: str = Field(..., description="Código ATCC u otra identificación", json_schema_extra={"example": "ATCC 6633"})
    lote: Optional[str] = Field(None, description="Lote de la cepa")
    pase: Optional[int] = Field(None, description="Número de pase (generación)")
    fecha_control: Optional[date] = Field(None, description="Fecha de control de viabilidad")
    estado_biologico: Optional[str] = Field(None, description="Estado actual (Congelada, Refrigerada, etc.)")

class CepaReferenciaCreate(CepaReferenciaBase):
    pass

class CepaReferenciaResponse(CepaReferenciaBase):
    cepa_referencia_id: int
    model_config = ConfigDict(from_attributes=True)
