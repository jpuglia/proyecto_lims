import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.backend.models.base import Base
# Import all models to ensure they are registered with Base.metadata
import src.backend.models as models
from src.backend.api.app import app
from src.backend.api.dependencies import get_db
from src.backend.api.security import hash_password
from src.backend.models.auth import Usuario, Rol, UsuarioRol

@pytest.fixture(scope="session")
def engine():
    # Use SQLite in-memory for tests
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="function")
def db_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture(scope="function")
def repository_context(db_session):
    """Fixture to provide a context for all repositories (if needed)"""
    return db_session


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient with DB override (no auth)."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _create_test_user_with_role(db_session, rol_nombre: str) -> Usuario:
    """Helper: inserta un usuario de test con el rol indicado en la BD de test."""
    # Asegurar que el rol exista
    rol = db_session.query(Rol).filter(Rol.nombre == rol_nombre).first()
    if not rol:
        rol = Rol(nombre=rol_nombre)
        db_session.add(rol)
        db_session.flush()

    username = f"test_{rol_nombre}_fixture"
    user = db_session.query(Usuario).filter(Usuario.nombre == username).first()
    if not user:
        user = Usuario(
            nombre=username,
            password_hash=hash_password("testpassword123"),
            firma="T.F.",
            activo=True,
        )
        db_session.add(user)
        db_session.flush()

        asignacion = UsuarioRol(usuario_id=user.usuario_id, rol_id=rol.rol_id)
        db_session.add(asignacion)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_client(db_session):
    """TestClient autenticado con rol 'administrador' — acceso total."""
    from src.backend.api.security import get_current_user

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    test_user = _create_test_user_with_role(db_session, "administrador")

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def supervisor_client(db_session):
    """TestClient autenticado con rol 'supervisor'."""
    from src.backend.api.security import get_current_user

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    test_user = _create_test_user_with_role(db_session, "supervisor")

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def operador_client(db_session):
    """TestClient autenticado con rol 'operador' — acceso limitado."""
    from src.backend.api.security import get_current_user

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    test_user = _create_test_user_with_role(db_session, "operador")

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
