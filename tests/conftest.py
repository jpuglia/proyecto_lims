import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.backend.models.base import Base
# Import all models to ensure they are registered with Base.metadata
import src.backend.models as models

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
