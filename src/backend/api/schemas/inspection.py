from enum import Enum
from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field, model_validator
from decimal import Decimal
from src.backend.api.schemas.dim import PuntoMuestreoResponse

class SamplingDestination(str, Enum):
    MICROBIOLOGIA = "Microbiología"
    FISICOQUIMICO = "Fisicoquímico"
    RETEN = "Retén"

class SamplingBase(BaseModel):
    inspector_id: int = Field(..., description="ID del usuario con rol Inspector")
    request_id: Optional[int] = Field(None, description="ID de la solicitud previa (opcional)")
    start_datetime: datetime = Field(..., description="Fecha y hora de inicio")
    end_datetime: datetime = Field(..., description="Fecha y hora de fin")
    
    product_id: Optional[int] = Field(None, description="ID del producto muestreado")
    lot_id: Optional[int] = Field(None, description="ID de la orden/lote muestreado")
    lot_number: Optional[str] = Field(None, description="Número de lote manual (para ad-hoc)")
    sampling_point_id: Optional[int] = Field(None, description="ID del punto de muestreo")
    
    extracted_quantity: Optional[Decimal] = Field(None, description="Cantidad extraída (requerida si es producto)")
    
    sample_type: Optional[str] = Field(None, description="Tipo de muestra (Agua, HVAC, Hisopado, etc.)")
    equipo_id: Optional[int] = Field(None, description="ID del equipo hisopado")
    operario_muestreado_id: Optional[int] = Field(None, description="ID del operario hisopado")
    area_id: Optional[int] = Field(None, description="ID del área hisopada")
    region_swabbed: Optional[str] = Field(None, description="Región específica hisopada")
    tyvek_wash_number: Optional[int] = Field(None, description="Nro. lavado del tyvek (para Hisopado Personal)")
    
    destination: SamplingDestination = Field(..., description="Destino de la muestra")
    batch_id: Optional[str] = Field(None, description="ID para agrupar muestreos creados juntos")

class SamplingCreate(SamplingBase):
    @model_validator(mode="after")
    def validate_conditional_fields(self) -> "SamplingCreate":
        if self.end_datetime <= self.start_datetime:
            raise ValueError("end_datetime debe ser estrictamente mayor que start_datetime")
        
        is_product_sampling = self.product_id is not None or self.lot_id is not None
        is_point_sampling = self.sampling_point_id is not None
        is_swab_sampling = self.sample_type == "Hisopado"
        
        if is_swab_sampling:
            if not any([self.equipo_id, self.operario_muestreado_id, self.area_id]):
                raise ValueError("Para Hisopado debe especificar Equipo, Persona o Área")
            if not self.region_swabbed:
                raise ValueError("Para Hisopado debe especificar la región (region_swabbed)")
            
            # Personal: Operario vs Tyvek
            if self.operario_muestreado_id and not self.equipo_id and not self.area_id:
                # If area_id is missing but operario is present, it might be an invalid Operario swab
                # (unless it's a Tyvek, which we distinguish by tyvek_wash_number)
                if self.tyvek_wash_number is None:
                    if not self.area_id:
                        # Re-checking area_id here because of the complex conditional
                        # Actually, let's be more direct:
                        pass 

            # Refined Personnel Swab Validation
            if self.operario_muestreado_id:
                if self.tyvek_wash_number is not None:
                    # Tyvek logic: region is already required above
                    pass
                else: 
                    # Real Operario logic
                    if not self.area_id:
                        raise ValueError("Para hisopado de Operario se requiere especificar el Área")
                    if not self.product_id and not self.lot_number:
                        raise ValueError("Para hisopado de Operario se requiere especificar Producto o Lote")
        elif is_product_sampling:
            if self.extracted_quantity is None:
                raise ValueError("extracted_quantity es requerido cuando se selecciona un Producto/Lote")
            if not self.lot_id and not self.lot_number:
                raise ValueError("Debe especificar el número de lote manual o vincular una orden de manufactura")
        elif not is_point_sampling and not is_product_sampling:
            # Fallback per current rules, must have something
            raise ValueError("Debe especificar un Producto/Lote, un Punto de Muestreo, o detalles de Hisopado")
            
        return self

class SamplingResponse(SamplingBase):
    id: str
    status: str
    reviewer_id: Optional[int] = None
    review_timestamp: Optional[datetime] = None
    submission_id: Optional[str] = None
    submission_timestamp: Optional[datetime] = None
    sampling_point: Optional[PuntoMuestreoResponse] = None

    model_config = ConfigDict(from_attributes=True)

class SamplingBatchSubmit(BaseModel):
    sampling_ids: List[str]

class SamplingUpdate(BaseModel):
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    product_id: Optional[int] = None
    lot_id: Optional[int] = None
    lot_number: Optional[str] = None
    sampling_point_id: Optional[int] = None
    extracted_quantity: Optional[Decimal] = None
    sample_type: Optional[str] = None
    equipo_id: Optional[int] = None
    operario_muestreado_id: Optional[int] = None
    area_id: Optional[int] = None
    region_swabbed: Optional[str] = None
    tyvek_wash_number: Optional[int] = None
    destination: Optional[SamplingDestination] = None

