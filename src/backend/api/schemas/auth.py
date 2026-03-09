"""Pydantic schemas for auth module."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Usuario ──────────────────────────────────────────────────

class UsuarioBase(BaseModel):
    nombre: str = Field(..., description="Nombre de usuario único", json_schema_extra={"example": "admin"})
    firma: Optional[str] = Field(None, description="Siglas o firma manuscrita digital", json_schema_extra={"example": "A.G."})
    activo: bool = Field(True, description="Estado del usuario en el sistema")

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., description="Contraseña en texto plano", min_length=8, json_schema_extra={"example": "P@ssw0rd123"})

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    firma: Optional[str] = None
    activo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    usuario_id: int
    roles: Optional[list["UsuarioRolResponse"]] = None
    laboratorios: Optional[list["UsuarioLaboratorioResponse"]] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Rol ──────────────────────────────────────────────────────

class RolBase(BaseModel):
    nombre: str = Field(..., description="Nombre del rol (ej. Admin, Supervisor, Analista)", json_schema_extra={"example": "Supervisor"})

class RolCreate(RolBase):
    pass

class RolResponse(RolBase):
    rol_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Laboratorio ──────────────────────────────────────────────

class LaboratorioBase(BaseModel):
    nombre: str = Field(..., description="Nombre del laboratorio (ej. Microbiología, Fisicoquímico)", json_schema_extra={"example": "Microbiología"})

class LaboratorioCreate(LaboratorioBase):
    pass

class LaboratorioResponse(LaboratorioBase):
    laboratorio_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── UsuarioRol ───────────────────────────────────────────────

class UsuarioRolCreate(BaseModel):
    usuario_id: int
    rol_id: int
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class UsuarioRolResponse(UsuarioRolCreate):
    usuario_rol_id: int
    rol: Optional[RolResponse] = None
    model_config = ConfigDict(from_attributes=True)


# ─── UsuarioLaboratorio ────────────────────────────────────────

class UsuarioLaboratorioCreate(BaseModel):
    usuario_id: int
    laboratorio_id: int

class UsuarioLaboratorioResponse(UsuarioLaboratorioCreate):
    usuario_laboratorio_id: int
    laboratorio: Optional[LaboratorioResponse] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Sync Payloads ───────────────────────────────────────────

class UserRolesSync(BaseModel):
    roles_ids: list[int] = Field(..., description="Lista de IDs de roles a asignar", json_schema_extra={"example": [1, 2]})

class UserLaboratoriosSync(BaseModel):
    laboratorios_ids: list[int] = Field(..., description="Lista de IDs de laboratorios a asignar", json_schema_extra={"example": [1]})


# ─── Operario ─────────────────────────────────────────────────

class OperarioBase(BaseModel):
    nombre: str = Field(..., description="Nombre del operario", json_schema_extra={"example": "Juan"})
    apellido: str = Field(..., description="Apellido del operario", json_schema_extra={"example": "Pérez"})
    codigo_empleado: str = Field(..., description="Código interno de empleado", json_schema_extra={"example": "EMP-001"})
    usuario_id: Optional[int] = Field(None, description="ID del usuario asociado (si tiene acceso al sistema)")
    activo: bool = Field(True, description="Estado de activación del operario")

class OperarioCreate(OperarioBase):
    pass

class OperarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    activo: Optional[bool] = None

class OperarioResponse(OperarioBase):
    operario_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── AuditLog ─────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    audit_log_id: int
    tabla_nombre: str
    registro_id: int
    operacion: str
    valor_anterior: Optional[dict] = None
    valor_nuevo: Optional[dict] = None
    usuario_id: Optional[int] = None
    ip_address: Optional[str] = None
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── Auth (Login) ─────────────────────────────────────────────

class LoginRequest(BaseModel):
    nombre: str = Field(..., description="Nombre de usuario", json_schema_extra={"example": "admin"})
    password: str = Field(..., description="Contraseña", json_schema_extra={"example": "P@ssw0rd123"})

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT Bearer token")
    token_type: str = Field("bearer", description="Tipo de token")


class SignatureRequest(BaseModel):
    password: str = Field(..., description="Contraseña para validar la firma")
    motivo: str = Field(..., description="Razón de la firma (ej. Aprobación de lote)", json_schema_extra={"example": "Liberación de lote por Supervisor"})
