from src.backend.database.db_manager import db_manager
from src.backend.models.fact import SolicitudMuestreo

def count_solicitudes():
    db = db_manager.SessionLocal()
    count = db.query(SolicitudMuestreo).count()
    print(f"Total solicitudes: {count}")
    db.close()

if __name__ == "__main__":
    count_solicitudes()
