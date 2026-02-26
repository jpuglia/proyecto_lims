"""Pydantic schemas for auth module."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ─── Usuario ──────────────────────────────────────────────────

class UsuarioBase(BaseModel):
    nombre: str
    firma: Optional[str] = None
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    firma: Optional[str] = None
    activo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    usuario_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Rol ──────────────────────────────────────────────────────

class RolBase(BaseModel):
    nombre: str

class RolCreate(RolBase):
    pass

class RolResponse(RolBase):
    rol_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── UsuarioRol ───────────────────────────────────────────────

class UsuarioRolCreate(BaseModel):
    usuario_id: int
    rol_id: int
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class UsuarioRolResponse(UsuarioRolCreate):
    usuario_rol_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Operario ─────────────────────────────────────────────────

class OperarioBase(BaseModel):
    nombre: str
    apellido: str
    codigo_empleado: str
    usuario_id: Optional[int] = None
    activo: bool = True

class OperarioCreate(OperarioBase):
    pass

class OperarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    activo: Optional[bool] = None

class OperarioResponse(OperarioBase):
    operario_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── AuditTrail ───────────────────────────────────────────────

class AuditTrailResponse(BaseModel):
    audit_trail_id: int
    tabla: str
    registro_id: int
    columna: Optional[str] = None
    old_val: Optional[str] = None
    new_val: Optional[str] = None
    accion: str
    timestamp: datetime
    usuario_id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Auth (Login) ─────────────────────────────────────────────

class LoginRequest(BaseModel):
    nombre: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
