from src.backend.database.db_manager import db_manager
from src.backend.models.fact import SolicitudMuestreo

def check_active():
    db = db_manager.SessionLocal()
    has_activo = hasattr(SolicitudMuestreo, "activo")
    print(f"SolicitudMuestreo has 'activo': {has_activo}")
    
    query = db.query(SolicitudMuestreo)
    if has_activo:
        query = query.filter(SolicitudMuestreo.activo == True)
    
    count = query.count()
    print(f"Count with filter logic: {count}")
    db.close()

if __name__ == "__main__":
    check_active()
