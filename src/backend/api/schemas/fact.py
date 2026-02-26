"""Pydantic schemas for fact module (manufacturing, sampling, analysis)."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ─── EstadoManufactura ────────────────────────────────────────

class EstadoManufacturaBase(BaseModel):
    nombre: str

class EstadoManufacturaCreate(EstadoManufacturaBase):
    pass

class EstadoManufacturaResponse(EstadoManufacturaBase):
    estado_manufactura_id: int
    model_config = ConfigDict(from_attributes=True)

class EstadoManufacturaUpdate(BaseModel):
    nombre: Optional[str] = None


# ─── OrdenManufactura ────────────────────────────────────────

class OrdenManufacturaBase(BaseModel):
    codigo: str
    lote: str
    fecha: date
    producto_id: int
    cantidad: float
    unidad: str
    operario_id: int

class OrdenManufacturaCreate(OrdenManufacturaBase):
    pass

class OrdenManufacturaResponse(OrdenManufacturaBase):
    orden_manufactura_id: int
    model_config = ConfigDict(from_attributes=True)

class OrdenManufacturaUpdate(BaseModel):
    codigo: Optional[str] = None
    lote: Optional[str] = None
    fecha: Optional[date] = None
    producto_id: Optional[int] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    operario_id: Optional[int] = None


# ─── Manufactura ─────────────────────────────────────────────

class ManufacturaBase(BaseModel):
    orden_manufactura_id: int
    estado_manufactura_id: int
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    observacion: Optional[str] = None

class ManufacturaCreate(ManufacturaBase):
    pass

class ManufacturaResponse(ManufacturaBase):
    manufactura_id: int
    model_config = ConfigDict(from_attributes=True)

class ManufacturaUpdate(BaseModel):
    estado_manufactura_id: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    observacion: Optional[str] = None

class CambioEstadoManufacturaRequest(BaseModel):
    nuevo_estado_id: int
    usuario_id: int


# ─── SolicitudMuestreo ──────────────────────────────────────

class SolicitudMuestreoBase(BaseModel):
    usuario_id: int
    tipo: str
    orden_manufactura_id: Optional[int] = None
    equipo_instrumento_id: Optional[int] = None
    punto_muestreo_id: Optional[int] = None
    operario_id: Optional[int] = None
    estado_solicitud_id: int
    observacion: Optional[str] = None

class SolicitudMuestreoCreate(SolicitudMuestreoBase):
    pass

class SolicitudMuestreoResponse(SolicitudMuestreoBase):
    solicitud_muestreo_id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class SolicitudMuestreoUpdate(BaseModel):
    tipo: Optional[str] = None
    orden_manufactura_id: Optional[int] = None
    equipo_instrumento_id: Optional[int] = None
    punto_muestreo_id: Optional[int] = None
    operario_id: Optional[int] = None
    estado_solicitud_id: Optional[int] = None
    observacion: Optional[str] = None


# ─── Muestreo ────────────────────────────────────────────────

class MuestreoBase(BaseModel):
    solicitud_muestreo_id: int
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    operario_id: int

class MuestreoCreate(MuestreoBase):
    pass

class MuestreoResponse(MuestreoBase):
    muestreo_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Muestra ─────────────────────────────────────────────────

class MuestraBase(BaseModel):
    muestreo_id: int
    punto_muestreo_id: Optional[int] = None
    zona_equipo_id: Optional[int] = None
    operario_muestreado_id: Optional[int] = None
    tipo_muestra: str
    codigo_etiqueta: str
    observacion: Optional[str] = None

class MuestraCreate(BaseModel):
    """Schema for creating a sample within a session (muestreo_id injected)."""
    punto_muestreo_id: Optional[int] = None
    zona_equipo_id: Optional[int] = None
    operario_muestreado_id: Optional[int] = None
    tipo_muestra: str
    codigo_etiqueta: str
    observacion: Optional[str] = None

class MuestraResponse(MuestraBase):
    muestra_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── MuestreoConMuestras (composite) ────────────────────────

class MuestreoConMuestrasCreate(BaseModel):
    session: MuestreoCreate
    muestras: List[MuestraCreate]


# ─── EnvioMuestra ────────────────────────────────────────────

class EnvioMuestraBase(BaseModel):
    muestra_id: int
    fecha: datetime
    operario_id: int
    destino: str

class EnvioMuestraCreate(EnvioMuestraBase):
    pass

class EnvioMuestraResponse(EnvioMuestraBase):
    envio_muestra_id: int
    model_config = ConfigDict(from_attributes=True)

class EnvioMuestraUpdate(BaseModel):
    muestra_id: Optional[int] = None
    fecha: Optional[datetime] = None
    operario_id: Optional[int] = None
    destino: Optional[str] = None


# ─── Recepcion ───────────────────────────────────────────────

class RecepcionBase(BaseModel):
    envio_muestra_id: int
    operario_id: int
    recibido_en: str
    decision: str
    observacion: Optional[str] = None

class RecepcionCreate(RecepcionBase):
    pass

class RecepcionResponse(RecepcionBase):
    recepcion_id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class RecepcionUpdate(BaseModel):
    envio_muestra_id: Optional[int] = None
    operario_id: Optional[int] = None
    recibido_en: Optional[str] = None
    decision: Optional[str] = None
    observacion: Optional[str] = None


# ─── Analisis ────────────────────────────────────────────────

class AnalisisBase(BaseModel):
    muestra_id: int
    recepcion_id: int
    metodo_version_id: int
    especificacion_id: Optional[int] = None
    estado_analisis_id: int
    fecha_inicio: Optional[datetime] = None
    operario_id: int

class AnalisisCreate(AnalisisBase):
    pass

class AnalisisResponse(AnalisisBase):
    analisis_id: int
    ultimo_cambio: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalisisUpdate(BaseModel):
    muestra_id: Optional[int] = None
    recepcion_id: Optional[int] = None
    metodo_version_id: Optional[int] = None
    especificacion_id: Optional[int] = None
    estado_analisis_id: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    operario_id: Optional[int] = None


# ─── Incubacion ──────────────────────────────────────────────

class IncubacionBase(BaseModel):
    analisis_id: int
    equipo_instrumento_id: int
    entrada: Optional[datetime] = None
    salida: Optional[datetime] = None
    temp_registrada: Optional[float] = None
    unidad_temp: Optional[str] = None

class IncubacionCreate(IncubacionBase):
    pass

class IncubacionResponse(IncubacionBase):
    incubacion_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Resultado ───────────────────────────────────────────────

class ResultadoBase(BaseModel):
    analisis_id: int
    fecha_reporte: Optional[datetime] = None
    operario_id: int
    valor: Optional[str] = None
    valor_numerico: Optional[float] = None
    unidad: Optional[str] = None
    observacion: Optional[str] = None

class ResultadoCreate(ResultadoBase):
    pass

class ResultadoResponse(ResultadoBase):
    resultado_id: int
    conforme: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)
