"""
JWT-based security module.

Provides password hashing, token generation/validation,
a FastAPI dependency to extract the current authenticated user,
and role-based access control (RBAC) via require_role().
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload

from src.backend.api.dependencies import get_db
from src.backend.models.auth import Usuario

# ─── Configuration ────────────────────────────────────────────

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Password Helpers ────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ─── Token Helpers ───────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ─── FastAPI Dependencies ──────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Decode JWT and return the authenticated Usuario (with roles loaded), or raise 401."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: Optional[str] = payload.get("sub")
        if sub is None:
            raise credentials_exception
        usuario_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles).joinedload("rol"))
        .filter(Usuario.usuario_id == usuario_id)
        .first()
    )
    if usuario is None:
        raise credentials_exception
    return usuario


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)),
) -> Optional[Usuario]:
    """Decode JWT and return the authenticated Usuario if token exists, else None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: Optional[str] = payload.get("sub")
        if sub is None:
            return None
        return (
            db.query(Usuario)
            .options(joinedload(Usuario.roles).joinedload("rol"))
            .filter(Usuario.usuario_id == int(sub))
            .first()
        )
    except (JWTError, ValueError, Exception):
        return None


# ─── Role Helpers ────────────────────────────────────────────

def get_user_roles(usuario: Usuario) -> list:
    """Return list of role names for a given Usuario."""
    return [ur.rol.nombre for ur in (usuario.roles or []) if ur.rol]


# ─── RBAC Dependency Factory ─────────────────────────────────

def require_role(*roles: str):
    """
    FastAPI dependency factory that enforces role-based access.

    Usage:
        @router.post("/", dependencies=[Depends(require_role("administrador", "supervisor"))])
        # or as a parameter:
        current_user: Usuario = Depends(require_role("administrador"))

    Raises HTTP 403 if the authenticated user doesn't have at least one of the required roles.
    """
    def _check(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        user_roles = get_user_roles(current_user)
        if not any(r in user_roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los roles: {', '.join(roles)}",
            )
        return current_user
    return _check
