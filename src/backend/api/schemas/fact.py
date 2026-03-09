"""Pydantic schemas for fact module (manufacturing, sampling, analysis)."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from src.backend.api.schemas.auth import UsuarioResponse
from src.backend.api.schemas.dim import PuntoMuestreoResponse


# ─── EstadoManufactura ────────────────────────────────────────

class EstadoManufacturaBase(BaseModel):
    nombre: str = Field(..., description="Nombre del estado de manufactura (ej. Pesada, Mezclado)", json_schema_extra={"example": "Pesada"})

class EstadoManufacturaCreate(EstadoManufacturaBase):
    pass

class EstadoManufacturaResponse(EstadoManufacturaBase):
    estado_manufactura_id: int
    model_config = ConfigDict(from_attributes=True)

class EstadoManufacturaUpdate(BaseModel):
    nombre: Optional[str] = None


# ─── OrdenManufactura ────────────────────────────────────────

class OrdenManufacturaBase(BaseModel):
    codigo: str = Field(..., description="Código de la orden (SAP/ERP)", json_schema_extra={"example": "OM-2023-001"})
    lote: str = Field(..., description="Lote del producto a fabricar", json_schema_extra={"example": "L23001"})
    fecha: date = Field(..., description="Fecha de emisión")
    producto_id: int = Field(..., description="ID del producto")
    cantidad: float = Field(..., description="Cantidad a fabricar", ge=0)
    unidad: str = Field(..., description="Unidad de medida", json_schema_extra={"example": "kg"})
    operario_id: int = Field(..., description="ID del operario responsable")

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
    orden_manufactura_id: int = Field(..., description="ID de la orden de manufactura")
    estado_manufactura_id: int = Field(..., description="ID del estado actual del proceso")
    fecha_inicio: Optional[datetime] = Field(None, description="Inicio real del proceso")
    fecha_fin: Optional[datetime] = Field(None, description="Fin real del proceso")
    observacion: Optional[str] = Field(None, description="Observaciones del proceso")

class ManufacturaCreate(ManufacturaBase):
    pass

class ManufacturaResponse(ManufacturaBase):
    manufactura_id: int
    model_config = ConfigDict(from_attributes=True)

class ManufacturaDetalleResponse(ManufacturaBase):
    """ManufacturaResponse enriquecida con el nombre del estado."""
    manufactura_id: int
    estado_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_extended(cls, obj):
        data = cls.model_validate(obj)
        if obj.estado:
            data.estado_nombre = obj.estado.nombre
        return data

class ManufacturaUpdate(BaseModel):
    estado_manufactura_id: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    observacion: Optional[str] = None

class CambioEstadoManufacturaRequest(BaseModel):
    nuevo_estado_id: int
    usuario_id: int


# ─── ManufacturaOperario ─────────────────────────────────────

class ManufacturaOperarioBase(BaseModel):
    manufactura_id: int = Field(..., description="ID del proceso de manufactura")
    operario_id: int = Field(..., description="ID del operario participante")
    entrada: Optional[datetime] = Field(None, description="Fecha/hora de entrada al proceso")
    salida: Optional[datetime] = Field(None, description="Fecha/hora de salida del proceso")
    rol_operacion: Optional[str] = Field(None, description="Rol desempeñado (ej. Preparador, Verificador)")

class ManufacturaOperarioCreate(ManufacturaOperarioBase):
    pass

class ManufacturaOperarioResponse(ManufacturaOperarioBase):
    manufactura_operario_id: int
    model_config = ConfigDict(from_attributes=True)

class ManufacturaOperarioDetalleResponse(ManufacturaOperarioResponse):
    """ManufacturaOperarioResponse enriquecida con nombre del operario."""
    operario_nombre: Optional[str] = None
    operario_apellido: Optional[str] = None

    @classmethod
    def from_orm_extended(cls, obj):
        data = cls.model_validate(obj)
        if obj.operario:
            data.operario_nombre = obj.operario.nombre
            data.operario_apellido = obj.operario.apellido
        return data


# ─── UsoMaterialManufactura ──────────────────────────────────

class UsoMaterialManufacturaBase(BaseModel):
    manufactura_id: int
    stock_polvo_suplemento_id: int
    cantidad: float
    unidad: str

class UsoMaterialManufacturaCreate(UsoMaterialManufacturaBase):
    pass

class UsoMaterialManufacturaResponse(UsoMaterialManufacturaBase):
    uso_material_manufactura_id: int
    fecha_uso: datetime
    model_config = ConfigDict(from_attributes=True)

class UsoMaterialManufacturaDetalleResponse(UsoMaterialManufacturaResponse):
    """UsoMaterialManufacturaResponse enriquecida con nombre del material."""
    material_nombre: Optional[str] = None
    lote_proveedor: Optional[str] = None

    @classmethod
    def from_orm_extended(cls, obj):
        data = cls.model_validate(obj)
        if obj.stock_polvo and obj.stock_polvo.recepcion:
            if obj.stock_polvo.recepcion.polvo_suplemento:
                data.material_nombre = obj.stock_polvo.recepcion.polvo_suplemento.nombre
            data.lote_proveedor = obj.stock_polvo.recepcion.lote_proveedor
        return data


class HistoricoEstadoManufacturaResponse(BaseModel):
    historico_estado_manufactura_id: int
    manufactura_id: int
    estado_manufactura_id: int
    estado_nombre: Optional[str] = None
    usuario_id: int
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── EstadoSolicitud ──────────────────────────────────────────

class EstadoSolicitudBase(BaseModel):
    nombre: str = Field(..., description="Nombre del estado de la solicitud (ej. Pendiente, Finalizado)", json_schema_extra={"example": "Pendiente"})

class EstadoSolicitudCreate(EstadoSolicitudBase):
    pass

class EstadoSolicitudResponse(EstadoSolicitudBase):
    estado_solicitud_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── SolicitudMuestreo ──────────────────────────────────────

class SolicitudMuestreoBase(BaseModel):
    usuario_id: int = Field(..., description="ID del usuario que solicita")
    tipo: str = Field(..., description="Tipo de solicitud (Ambiental, Producto, Proceso, etc.)", json_schema_extra={"example": "Ambiental"})
    fecha_limite: Optional[datetime] = Field(None, description="Fecha límite para completar el muestreo")
    orden_manufactura_id: Optional[int] = Field(None, description="ID de orden asociada")
    equipo_instrumento_id: Optional[int] = Field(None, description="ID de equipo asociado (Legacy)")
    punto_muestreo_id: Optional[int] = Field(None, description="ID de punto de muestreo")
    operario_id: Optional[int] = Field(None, description="ID de operario asociado")
    estado_solicitud_id: int = Field(..., description="ID del estado de la solicitud")
    observacion: Optional[str] = Field(None, description="Notas adicionales")
    
    # Ad-hoc Extension Fields
    destino: Optional[str] = None
    producto_id: Optional[int] = None
    lote_number: Optional[str] = None
    cantidad_extraida: Optional[float] = None
    area_id: Optional[int] = None
    region_swabbed: Optional[str] = None

class SolicitudMuestreoCreate(SolicitudMuestreoBase):
    equipos_ids: Optional[List[int]] = Field(None, description="Lista de IDs de equipos utilizados")

class SolicitudMuestreoResponse(SolicitudMuestreoBase):
    solicitud_muestreo_id: int
    fecha: datetime
    equipamiento: Optional[List["SolicitudMuestreoEquipoResponse"]] = None
    
    usuario: Optional[UsuarioResponse] = None
    orden_manufactura: Optional[OrdenManufacturaResponse] = None
    punto_muestreo: Optional[PuntoMuestreoResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class SolicitudMuestreoEquipoResponse(BaseModel):
    solicitud_muestreo_equipo_id: int
    solicitud_muestreo_id: int
    equipo_instrumento_id: int
    model_config = ConfigDict(from_attributes=True)

class SolicitudMuestreoUpdate(BaseModel):
    tipo: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    orden_manufactura_id: Optional[int] = None
    equipo_instrumento_id: Optional[int] = None
    punto_muestreo_id: Optional[int] = None
    operario_id: Optional[int] = None
    estado_solicitud_id: Optional[int] = None
    observacion: Optional[str] = None
    equipos_ids: Optional[List[int]] = None
    destino: Optional[str] = None
    producto_id: Optional[int] = None
    lote_number: Optional[str] = None
    cantidad_extraida: Optional[float] = None
    area_id: Optional[int] = None
    region_swabbed: Optional[str] = None


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
    envios: Optional[List[EnvioMuestraCreate]] = None


# ─── EnvioMuestra ────────────────────────────────────────────

class EnvioMuestraBase(BaseModel):
    muestra_id: int
    fecha: datetime
    operario_id: int
    corroborado_por_id: Optional[int] = None
    fecha_corroboracion: Optional[datetime] = None
    laboratorio_id: Optional[int] = None

class EnvioMuestraCreate(EnvioMuestraBase):
    pass

class EnvioMuestraResponse(EnvioMuestraBase):
    envio_muestra_id: int
    model_config = ConfigDict(from_attributes=True)

class EnvioMuestraUpdate(BaseModel):
    muestra_id: Optional[int] = None
    fecha: Optional[datetime] = None
    operario_id: Optional[int] = None
    corroborado_por_id: Optional[int] = None
    fecha_corroboracion: Optional[datetime] = None
    laboratorio_id: Optional[int] = None


# ─── Recepcion ───────────────────────────────────────────────

class RecepcionBase(BaseModel):
    envio_muestra_id: int
    operario_id: int
    recibido_en: Optional[str] = None # Legacy
    laboratorio_id: Optional[int] = None
    decision: str
    justificacion: Optional[str] = None
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
    laboratorio_id: Optional[int] = None
    decision: Optional[str] = None
    justificacion: Optional[str] = None
    observacion: Optional[str] = None


# ─── EstadoAnalisis ───────────────────────────────────────────

class EstadoAnalisisBase(BaseModel):
    nombre: str = Field(..., description="Nombre del estado de análisis (ej. Programado, En proceso)", json_schema_extra={"example": "Programado"})

class EstadoAnalisisCreate(EstadoAnalisisBase):
    pass

class EstadoAnalisisResponse(EstadoAnalisisBase):
    estado_analisis_id: int
    model_config = ConfigDict(from_attributes=True)


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

class AnalisisBulkCreate(BaseModel):
    muestra_id: int
    recepcion_id: int
    metodos_versions_ids: List[int]
    operario_id: int
    estado_analisis_id: int = 1 # Por defecto Programado

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

class CambioEstadoAnalisisRequest(BaseModel):
    nuevo_estado_id: int
    operario_id: int


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

class IncubacionUpdate(BaseModel):
    entrada: Optional[datetime] = None
    salida: Optional[datetime] = None
    temp_registrada: Optional[float] = None
    unidad_temp: Optional[str] = None

class ResultadoBase(BaseModel):
    analisis_id: int = Field(..., description="ID del análisis asociado")
    fecha_reporte: Optional[datetime] = Field(None, description="Fecha de reporte del resultado")
    operario_id: int = Field(..., description="ID del operario que reporta")
    valor: Optional[str] = Field(None, description="Valor textual (CUMPLE, NO CUMPLE, etc.)")
    valor_numerico: Optional[float] = Field(None, description="Valor numérico obtenido")
    unidad: Optional[str] = Field(None, description="Unidad de medida")
    observacion: Optional[str] = Field(None, description="Observaciones adicionales")

class ResultadoCreate(ResultadoBase):
    pass

class ResultadoResponse(ResultadoBase):
    resultado_id: int
    conforme: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Uso de Recursos (Step 7) ────────────────────────────────

class UsoMediosCreate(BaseModel):
    analisis_id: int
    stock_medios_id: int

class UsoCepaCreate(BaseModel):
    analisis_id: int
    cepa_referencia_id: int


# ─── Reporte Consolidado (Step 10) ──────────────────────────

class ReporteConsolidadoResponse(BaseModel):
    solicitud: SolicitudMuestreoResponse
    muestreo: Optional[MuestreoResponse] = None
    muestras: List[MuestraResponse] = []
    envios: List[EnvioMuestraResponse] = []
    recepciones: List[RecepcionResponse] = []
    analisis: List[AnalisisResponse] = []
    incubaciones: List[IncubacionResponse] = []
    resultados: List[ResultadoResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class OrdenManufacturaDetalleResponse(OrdenManufacturaBase):
    """OrdenManufacturaResponse con procesos y solicitudes para trazabilidad."""
    orden_manufactura_id: int
    procesos: List[ManufacturaDetalleResponse] = []
    solicitudes: List[SolicitudMuestreoResponse] = []

    model_config = ConfigDict(from_attributes=True)


# Rebuild forward refs
OrdenManufacturaDetalleResponse.model_rebuild()
ReporteConsolidadoResponse.model_rebuild()
