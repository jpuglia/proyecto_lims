from typing import Callable, List, Tuple

from sqlalchemy.orm import Session

from src.backend.database.db_manager import db_manager


Loader = Callable[[str, Session], None]


def run_pipeline(loaders: List[Tuple[str, Loader, str]]):
    """
    Ejecuta múltiples loaders en una sola transacción.
    """

    db: Session = db_manager.SessionLocal()

    try:

        for name, loader, file_path in loaders:

            print(f"Cargando {name}...")

            loader(file_path, db)

        db.commit()

        print("Pipeline completado correctamente.")

    except Exception as e:

        db.rollback()

        print("ERROR: Rollback global ejecutado.")
        print(str(e))

        raise

    finally:

        db.close()
