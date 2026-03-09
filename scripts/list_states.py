from src.backend.database.db_manager import db_manager
from src.backend.models.fact import EstadoSolicitud

def list_states():
    db = db_manager.SessionLocal()
    states = db.query(EstadoSolicitud).all()
    for s in states:
        print(f"ID: {s.estado_solicitud_id}, Nombre: {s.nombre}")
    db.close()

if __name__ == "__main__":
    list_states()
