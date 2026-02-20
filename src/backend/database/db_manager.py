#src/backend/database/db_manager.py
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.backend.models.base import Base


class DataBaseManager:

    def __init__(self, db_url: str):

        self.engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},  # Requerido para SQLite
            pool_pre_ping=True
        )

        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

    def init_db(self):
        Base.metadata.create_all(bind=self.engine)

    def get_session(self):

        db = self.SessionLocal()

        try:
            yield db
            db.commit()

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()


# =========================
# Configuración SQLite
# =========================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./lab_dev.db"
)

db_manager = DataBaseManager(DATABASE_URL)
