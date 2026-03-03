from src.backend.database.db_manager import db_manager
from src.backend.models.auth import Usuario
from src.backend.api.security import hash_password

def reset_admin_password():
    db = db_manager.SessionLocal()
    try:
        admin = db.query(Usuario).filter(Usuario.nombre == 'admin').first()
        if admin:
            print(f"Updating password for admin (id={admin.usuario_id})...")
            admin.password_hash = hash_password("admin123")
            db.commit()
            print("Password updated successfully.")
        else:
            print("Admin user not found. Creating it...")
            new_admin = Usuario(
                nombre="admin",
                password_hash=hash_password("admin123"),
                firma="ADMIN",
                activo=True
            )
            db.add(new_admin)
            db.commit()
            print("Admin user created successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
