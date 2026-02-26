"""Pydantic schemas for inventory module (powders, media, stock)."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


# ─── PolvoSuplemento ──────────────────────────────────────────

class PolvoSuplementoBase(BaseModel):
    codigo: str = Field(..., description="Código del reactivo/polvo", json_schema_extra={"example": "REACT-001"})
    nombre: str = Field(..., description="Nombre descriptivo", json_schema_extra={"example": "Agar Nutritivo"})
    unidad: str = Field(..., description="Unidad de medida base", json_schema_extra={"example": "g"})
    activo: bool = Field(True, description="Estado del registro")

class PolvoSuplementoCreate(PolvoSuplementoBase):
    pass

class PolvoSuplementoResponse(PolvoSuplementoBase):
    polvo_suplemento_id: int
    model_config = ConfigDict(from_attributes=True)

class PolvoSuplementoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    unidad: Optional[str] = None
    activo: Optional[bool] = None


# ─── RecepcionPolvoSuplemento ────────────────────────────────

class RecepcionPolvoBase(BaseModel):
    polvo_suplemento_id: int = Field(..., description="ID del reactivo/polvo recibido")
    lote_proveedor: str = Field(..., description="Lote asignado por el fabricante", json_schema_extra={"example": "PROV-9988"})
    vence: date = Field(..., description="Fecha de vencimiento del lote")
    cantidad: float = Field(..., description="Cantidad recibida", ge=0, json_schema_extra={"example": 500.0})

class RecepcionPolvoCreate(RecepcionPolvoBase):
    pass

class RecepcionPolvoResponse(RecepcionPolvoBase):
    recepcion_polvo_suplemento_id: int
    model_config = ConfigDict(from_attributes=True)

class RecepcionPolvoUpdate(BaseModel):
    polvo_suplemento_id: Optional[int] = Field(None, description="Nuevo ID del reactivo")
    lote_proveedor: Optional[str] = Field(None, description="Nuevo lote del proveedor")
    vence: Optional[date] = Field(None, description="Nueva fecha de vencimiento")
    cantidad: Optional[float] = Field(None, description="Nueva cantidad", ge=0)


# ─── MedioPreparado ──────────────────────────────────────────

class MedioPreparadoBase(BaseModel):
    codigo: str = Field(..., description="Código único del medio (ej. MP-001)", json_schema_extra={"example": "MP-AGAR-01"})
    nombre: str = Field(..., description="Nombre descriptivo del medio preparado", json_schema_extra={"example": "Agar Nutritivo (Preparado)"})
    activo: bool = Field(True, description="Estado del registro")

class MedioPreparadoCreate(MedioPreparadoBase):
    pass

class MedioPreparadoResponse(MedioPreparadoBase):
    medio_preparado_id: int
    model_config = ConfigDict(from_attributes=True)

class MedioPreparadoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    activo: Optional[bool] = None


# ─── OrdenPreparacionMedio ───────────────────────────────────

class ConsumoPolvo(BaseModel):
    stock_polvo_suplemento_id: int
    cantidad: float
    unidad: str

class OrdenPreparacionBase(BaseModel):
    medio_preparado_id: int = Field(..., description="ID del medio a preparar")
    lote: str = Field(..., description="Lote interno asignado", json_schema_extra={"example": "LAB-2023-001"})
    volumen_total: float = Field(..., description="Volumen final preparado", ge=0)
    unidad_volumen: str = Field(..., description="Unidad del volumen", json_schema_extra={"example": "mL"})
    operario_id: int = Field(..., description="ID del operario que prepara")

class OrdenPreparacionCreate(BaseModel):
    orden: OrdenPreparacionBase
    consumos: List[ConsumoPolvo]

class OrdenPreparacionResponse(OrdenPreparacionBase):
    orden_preparacion_medio_id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── StockMedios ─────────────────────────────────────────────

class StockMediosResponse(BaseModel):
    stock_medios_id: int = Field(..., description="ID del registro de stock")
    orden_preparacion_medio_id: int = Field(..., description="ID de la orden de preparación")
    lote_interno: str = Field(..., description="Lote interno asignado", json_schema_extra={"example": "LAB-23-001"})
    vence: date = Field(..., description="Fecha de vencimiento calculada")
    estado_qc_id: int = Field(..., description="ID del estado de control de calidad")
    model_config = ConfigDict(from_attributes=True)


# ─── AprobacionMedios ────────────────────────────────────────

class AprobacionMediosBase(BaseModel):
    stock_medios_id: int
    operario_id: int
    observacion: Optional[str] = None

class AprobacionMediosCreate(AprobacionMediosBase):
    pass

class AprobacionMediosResponse(AprobacionMediosBase):
    aprobacion_medios_id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class AprobacionMediosUpdate(BaseModel):
    stock_medios_id: Optional[int] = None
    operario_id: Optional[int] = None
    observacion: Optional[str] = None
