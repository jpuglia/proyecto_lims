"""Auth router – login, register, users, roles, operators."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db, get_auth_service
from src.backend.api.security import hash_password, verify_password, create_access_token, get_current_user, get_current_user_optional
from src.backend.api.schemas.auth import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    RolCreate, RolResponse,
    UsuarioRolCreate, UsuarioRolResponse,
    OperarioCreate, OperarioUpdate, OperarioResponse,
    AuditTrailResponse,
    LoginRequest, TokenResponse,
)
from src.backend.models.auth import Usuario
from src.backend.repositories.auth import (
    UsuarioRepository, RolRepository, UsuarioRolRepository, OperarioRepository,
    AuditTrailRepository,
)
from src.backend.services.auth_service import AuthService

router = APIRouter()


# ─── Login ────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    usuario_repo = UsuarioRepository()
    usuario = usuario_repo.get_by_nombre(db, body.nombre)

    if not usuario or not usuario.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not verify_password(body.password, usuario.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    token = create_access_token(data={"sub": usuario.usuario_id})
    return TokenResponse(access_token=token)


# ─── Usuarios ────────────────────────────────────────────────

@router.post("/usuarios", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(
    body: UsuarioCreate,
    db: Session = Depends(get_db),
    service: AuthService = Depends(get_auth_service),
    current_user: Optional[Usuario] = Depends(get_current_user_optional), # Use optional for bootstrap
):
    user_data = body.model_dump(exclude={"password"})
    user_data["password_hash"] = hash_password(body.password)
    
    current_uid = current_user.usuario_id if current_user else None
    nuevo = service.create_usuario(db, user_data, current_user_id=current_uid)
    return nuevo


@router.get("/usuarios", response_model=List[UsuarioResponse])
def list_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = UsuarioRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def get_usuario(usuario_id: int, db: Session = Depends(get_db)):
    repo = UsuarioRepository()
    usuario = repo.get(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def update_usuario(usuario_id: int, body: UsuarioUpdate, db: Session = Depends(get_db)):
    repo = UsuarioRepository()
    usuario = repo.get(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    updated = repo.update(db, usuario, body.model_dump(exclude_unset=True))
    return updated


# ─── Roles ────────────────────────────────────────────────────

@router.post("/roles", response_model=RolResponse, status_code=status.HTTP_201_CREATED)
def create_rol(body: RolCreate, db: Session = Depends(get_db)):
    repo = RolRepository()
    return repo.create(db, body.model_dump())


@router.get("/roles", response_model=List[RolResponse])
def list_roles(db: Session = Depends(get_db)):
    repo = RolRepository()
    return repo.get_all(db)


# ─── UsuarioRol ──────────────────────────────────────────────

@router.post("/usuarios-roles", response_model=UsuarioRolResponse, status_code=status.HTTP_201_CREATED)
def assign_role(body: UsuarioRolCreate, db: Session = Depends(get_db)):
    repo = UsuarioRolRepository()
    return repo.create(db, body.model_dump())


# ─── Operarios ───────────────────────────────────────────────

@router.post("/operarios", response_model=OperarioResponse, status_code=status.HTTP_201_CREATED)
def create_operario(body: OperarioCreate, db: Session = Depends(get_db)):
    repo = OperarioRepository()
    return repo.create(db, body.model_dump())


@router.get("/operarios", response_model=List[OperarioResponse])
def list_operarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = OperarioRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/operarios/{operario_id}", response_model=OperarioResponse)
def get_operario(operario_id: int, db: Session = Depends(get_db)):
    repo = OperarioRepository()
    operario = repo.get(db, operario_id)
    if not operario:
        raise HTTPException(status_code=404, detail="Operario no encontrado")
    return operario


# ─── Audit Trail ─────────────────────────────────────────────

@router.get("/audit-trail", response_model=List[AuditTrailResponse])
def list_audit_trail(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = AuditTrailRepository()
    return repo.get_all(db, skip=skip, limit=limit)


@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
