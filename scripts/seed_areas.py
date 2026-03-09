from src.backend.database.db_manager import db_manager
from src.backend.models.dim import Area, ZonaArea

def seed():
    db = db_manager.SessionLocal()
    try:
        areas = db.query(Area).all()
        for i, area in enumerate(areas, 1):
            area.codigo = f"PA{i:03d}"
            
            # Default zones
            default_names = ["Piso", "Pared", "Pestillo"]
            existing_zones = [z.nombre for z in area.zonas]
            
            for name in default_names:
                if name not in existing_zones:
                    db.add(ZonaArea(area_id=area.area_id, nombre=name, activo=True))
        
        db.commit()
        print(f"Seeded {len(areas)} areas.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
