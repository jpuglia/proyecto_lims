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


@pytest.fixture(scope="function")
def auth_client(db_session):
    """TestClient autenticado: hace override de get_current_user con un usuario de test."""
    from src.backend.api.security import hash_password, get_current_user
    from src.backend.models.auth import Usuario

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Insertar usuario de test directamente en la BD de test
    test_user = Usuario(
        nombre="test_auth_fixture",
        password_hash=hash_password("testpassword123"),
        firma="T.F.",
        activo=True,
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)

    # Override de get_current_user: siempre retorna nuestro usuario de test
    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
