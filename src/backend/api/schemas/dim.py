"""Pydantic schemas for dim module (systems, plants, areas, equipment)."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Sistema ──────────────────────────────────────────────────

class SistemaBase(BaseModel):
    codigo: str
    nombre: str
    activo: bool = True

class SistemaCreate(SistemaBase):
    pass

class SistemaResponse(SistemaBase):
    sistema_id: int
    model_config = ConfigDict(from_attributes=True)

class SistemaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    activo: Optional[bool] = None


# ─── Planta ───────────────────────────────────────────────────

class PlantaBase(BaseModel):
    codigo: str
    nombre: str
    sistema_id: int
    activo: bool = True

class PlantaCreate(PlantaBase):
    pass

class PlantaResponse(PlantaBase):
    planta_id: int
    model_config = ConfigDict(from_attributes=True)

class PlantaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    sistema_id: Optional[int] = None
    activo: Optional[bool] = None


# ─── Area ─────────────────────────────────────────────────────

class AreaBase(BaseModel):
    nombre: str
    planta_id: int
    activo: bool = True

class AreaCreate(AreaBase):
    pass

class AreaResponse(AreaBase):
    area_id: int
    model_config = ConfigDict(from_attributes=True)

class AreaUpdate(BaseModel):
    nombre: Optional[str] = None
    planta_id: Optional[int] = None
    activo: Optional[bool] = None


# ─── TipoEquipo ──────────────────────────────────────────────

class TipoEquipoBase(BaseModel):
    nombre: str

class TipoEquipoCreate(TipoEquipoBase):
    pass

class TipoEquipoResponse(TipoEquipoBase):
    tipo_equipo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── EstadoEquipo ─────────────────────────────────────────────

class EstadoEquipoBase(BaseModel):
    nombre: str

class EstadoEquipoCreate(EstadoEquipoBase):
    pass

class EstadoEquipoResponse(EstadoEquipoBase):
    estado_equipo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── EquipoInstrumento ───────────────────────────────────────

class EquipoInstrumentoBase(BaseModel):
    codigo: str = Field(..., description="Código de inventario/etiqueta", json_schema_extra={"example": "EQU-001"})
    nombre: str = Field(..., description="Nombre del equipo", json_schema_extra={"example": "Incubadora Memmert"})
    tipo_equipo_id: int = Field(..., description="ID del tipo de equipo")
    estado_equipo_id: int = Field(..., description="ID del estado actual")
    area_id: int = Field(..., description="ID del área de ubicación")

class EquipoInstrumentoCreate(EquipoInstrumentoBase):
    pass

class EquipoInstrumentoUpdate(BaseModel):
    nombre: Optional[str] = None
    estado_equipo_id: Optional[int] = None

class EquipoInstrumentoResponse(EquipoInstrumentoBase):
    equipo_instrumento_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── CambioEstadoEquipo ──────────────────────────────────────

class CambioEstadoEquipoRequest(BaseModel):
    nuevo_estado_id: int
    usuario_id: int


# ─── ZonaEquipo ───────────────────────────────────────────────

class ZonaEquipoBase(BaseModel):
    equipo_instrumento_id: int
    nombre: str
    activo: bool = True

class ZonaEquipoCreate(ZonaEquipoBase):
    pass

class ZonaEquipoResponse(ZonaEquipoBase):
    zona_equipo_id: int
    model_config = ConfigDict(from_attributes=True)

class ZonaEquipoUpdate(BaseModel):
    equipo_instrumento_id: Optional[int] = None
    nombre: Optional[str] = None
    activo: Optional[bool] = None


# ─── CalibracionCalificacionEquipo ───────────────────────────

class CalibracionBase(BaseModel):
    tipo: str
    equipo_instrumento_id: int
    fecha: date
    vence: Optional[date] = None
    operario_id: int

class CalibracionCreate(CalibracionBase):
    pass

class CalibracionResponse(CalibracionBase):
    calibracion_calificacion_equipo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── PuntoMuestreo ───────────────────────────────────────────

class PuntoMuestreoBase(BaseModel):
    codigo: str
    nombre: str
    sistema_id: Optional[int] = None
    area_id: Optional[int] = None
    activo: bool = True

class PuntoMuestreoCreate(PuntoMuestreoBase):
    pass

class PuntoMuestreoResponse(PuntoMuestreoBase):
    punto_muestreo_id: int
    model_config = ConfigDict(from_attributes=True)

class PuntoMuestreoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    sistema_id: Optional[int] = None
    area_id: Optional[int] = None
    activo: Optional[bool] = None
