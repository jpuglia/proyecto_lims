"""Pydantic schemas for dim module (systems, plants, areas, equipment)."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


# ─── Sistema ──────────────────────────────────────────────────

class SistemaBase(BaseModel):
    codigo: str = Field(..., description="Código único del sistema", json_schema_extra={"example": "SIST-01"})
    nombre: str = Field(..., description="Nombre descriptivo del sistema", json_schema_extra={"example": "Sistema de Agua Purificada"})
    activo: bool = Field(True, description="Estado de activación del sistema")

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
    codigo: str = Field(..., description="Código único de la planta", json_schema_extra={"example": "PLT-BOU"})
    nombre: str = Field(..., description="Nombre de la planta física", json_schema_extra={"example": "Planta Camino Carrasco"})
    sistema_id: int = Field(..., description="ID del sistema al que pertenece")
    activo: bool = Field(True, description="Estado de activación de la planta")

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
    codigo: str = Field(..., description="Código de identificación del área", json_schema_extra={"example": "PA036"})
    nombre: str = Field(..., description="Nombre del área funcional", json_schema_extra={"example": "Laboratorio de Microbiología"})
    planta_id: int = Field(..., description="ID de la planta donde se ubica el área")
    activo: bool = Field(True, description="Estado de activación del área")

class AreaCreate(AreaBase):
    pass

class AreaResponse(AreaBase):
    area_id: int
    zonas: List[ZonaAreaResponse] = []
    model_config = ConfigDict(from_attributes=True)

class AreaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    planta_id: Optional[int] = None
    activo: Optional[bool] = None


# ─── TipoEquipo ──────────────────────────────────────────────

class TipoEquipoBase(BaseModel):
    nombre: str = Field(..., description="Nombre del tipo de equipo", json_schema_extra={"example": "HPLC"})

class TipoEquipoCreate(TipoEquipoBase):
    pass

class TipoEquipoResponse(TipoEquipoBase):
    tipo_equipo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── EstadoEquipo ─────────────────────────────────────────────

class EstadoEquipoBase(BaseModel):
    nombre: str = Field(..., description="Nombre del estado del equipo", json_schema_extra={"example": "Operativo"})

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

class EquipoDetalleResponse(EquipoInstrumentoResponse):
    tipo_nombre: Optional[str] = None
    estado_nombre: Optional[str] = None
    area_nombre: Optional[str] = None
    zonas: List[ZonaEquipoResponse] = []
    is_compliant: bool = True

    @classmethod
    def from_orm_extended(cls, obj):
        data = cls.model_validate(obj)
        if hasattr(obj, "tipo_equipo") and obj.tipo_equipo:
            data.tipo_nombre = obj.tipo_equipo.nombre
        if hasattr(obj, "estado") and obj.estado:
            data.estado_nombre = obj.estado.nombre
        if hasattr(obj, "area") and obj.area:
            data.area_nombre = obj.area.nombre
        
        if hasattr(obj, "zonas") and obj.zonas:
            data.zonas = [ZonaEquipoResponse.model_validate(z) for z in obj.zonas]

        # Check compliance based on last calibration
        if hasattr(obj, "calibraciones") and obj.calibraciones:
            from datetime import date
            # Get the most recent calibration
            latest = sorted(obj.calibraciones, key=lambda x: x.fecha, reverse=True)[0]
            if latest.vence and latest.vence < date.today():
                data.is_compliant = False
        
        return data


# ─── CambioEstadoEquipo ──────────────────────────────────────

class CambioEstadoEquipoRequest(BaseModel):
    nuevo_estado_id: int
    usuario_id: int


# ─── ZonaEquipo ───────────────────────────────────────────────

class ZonaEquipoBase(BaseModel):
    equipo_instrumento_id: int = Field(..., description="ID del equipo al que pertenece la zona")
    nombre: str = Field(..., description="Nombre de la zona de muestreo", json_schema_extra={"example": "Cámara Interna"})
    activo: bool = Field(True, description="Estado de activación de la zona")

class ZonaEquipoCreate(ZonaEquipoBase):
    pass

class ZonaEquipoResponse(ZonaEquipoBase):
    zona_equipo_id: int
    model_config = ConfigDict(from_attributes=True)

class ZonaEquipoUpdate(BaseModel):
    equipo_instrumento_id: Optional[int] = None
    nombre: Optional[str] = None
    activo: Optional[bool] = None


# ─── ZonaArea ──────────────────────────────────────────────────

class ZonaAreaBase(BaseModel):
    area_id: int = Field(..., description="ID del área a la que pertenece la zona")
    nombre: str = Field(..., description="Nombre de la zona de muestreo", json_schema_extra={"example": "Pared"})
    activo: bool = Field(True, description="Estado de activación de la zona")

class ZonaAreaCreate(ZonaAreaBase):
    pass

class ZonaAreaResponse(ZonaAreaBase):
    zona_area_id: int
    model_config = ConfigDict(from_attributes=True)

class ZonaAreaUpdate(BaseModel):
    nombre: Optional[str] = None
    activo: Optional[bool] = None


# ─── CalibracionCalificacionEquipo ───────────────────────────

class CalibracionBase(BaseModel):
    tipo: str = Field(..., description="Tipo de intervención (Calibración/Calificación)", json_schema_extra={"example": "Calibración"})
    equipo_instrumento_id: int = Field(..., description="ID del equipo intervenido")
    fecha: date = Field(..., description="Fecha de realización")
    vence: Optional[date] = Field(None, description="Fecha de vencimiento (si aplica)")
    operario_id: int = Field(..., description="ID del operario que realizó la tarea")

class CalibracionCreate(CalibracionBase):
    pass

class CalibracionResponse(CalibracionBase):
    calibracion_calificacion_equipo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── PuntoMuestreo ───────────────────────────────────────────

class PuntoMuestreoBase(BaseModel):
    codigo: str = Field(..., description="Código identificador del punto", json_schema_extra={"example": "PM-H-01"})
    nombre: str = Field(..., description="Nombre descriptivo del punto de muestreo", json_schema_extra={"example": "Grifo de Retorno 1"})
    sistema_id: Optional[int] = Field(None, description="ID del sistema asociado")
    area_id: Optional[int] = Field(None, description="ID del área asociada")
    activo: bool = Field(True, description="Estado de activación del punto")

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

# ─── TipoSolicitudMuestreo ───────────────────────────────────

class TipoSolicitudMuestreoBase(BaseModel):
    codigo: str = Field(..., description="Código único del tipo de solicitud", json_schema_extra={"example": "AIRE_AREA"})
    descripcion: str = Field(..., description="Descripción legible del tipo", json_schema_extra={"example": "Aire área"})
    categoria: Optional[str] = Field(None, description="Categoría de agrupación", json_schema_extra={"example": "Ambiental"})
    activo: bool = Field(True, description="Estado de activación")

class TipoSolicitudMuestreoCreate(TipoSolicitudMuestreoBase):
    pass

class TipoSolicitudMuestreoResponse(TipoSolicitudMuestreoBase):
    tipo_solicitud_id: int
    model_config = ConfigDict(from_attributes=True)

class TipoSolicitudMuestreoUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    activo: Optional[bool] = None
