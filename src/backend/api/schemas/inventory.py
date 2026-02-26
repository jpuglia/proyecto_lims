"""Pydantic schemas for inventory module (powders, media, stock)."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ─── PolvoSuplemento ──────────────────────────────────────────

class PolvoSuplementoBase(BaseModel):
    codigo: str
    nombre: str
    unidad: str
    activo: bool = True

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
    polvo_suplemento_id: int
    lote_proveedor: str
    vence: date
    cantidad: float

class RecepcionPolvoCreate(RecepcionPolvoBase):
    pass

class RecepcionPolvoResponse(RecepcionPolvoBase):
    recepcion_polvo_suplemento_id: int
    model_config = ConfigDict(from_attributes=True)

class RecepcionPolvoUpdate(BaseModel):
    polvo_suplemento_id: Optional[int] = None
    lote_proveedor: Optional[str] = None
    vence: Optional[date] = None
    cantidad: Optional[float] = None


# ─── MedioPreparado ──────────────────────────────────────────

class MedioPreparadoBase(BaseModel):
    codigo: str
    nombre: str
    activo: bool = True

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
    medio_preparado_id: int
    lote: str
    volumen_total: float
    unidad_volumen: str
    operario_id: int

class OrdenPreparacionCreate(BaseModel):
    orden: OrdenPreparacionBase
    consumos: List[ConsumoPolvo]

class OrdenPreparacionResponse(OrdenPreparacionBase):
    orden_preparacion_medio_id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── StockMedios ─────────────────────────────────────────────

class StockMediosResponse(BaseModel):
    stock_medios_id: int
    orden_preparacion_medio_id: int
    lote_interno: str
    vence: date
    estado_qc_id: int
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
