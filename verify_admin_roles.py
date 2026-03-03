from src.backend.database.db_manager import db_manager
from src.backend.models.auth import Usuario, Rol, UsuarioRol
from sqlalchemy.orm import joinedload

def verify_admin_roles():
    db = db_manager.SessionLocal()
    try:
        admin = (
            db.query(Usuario)
            .options(joinedload(Usuario.roles).joinedload(UsuarioRol.rol))
            .filter(Usuario.nombre == 'admin')
            .first()
        )
        if admin:
            roles = [ur.rol.nombre for ur in admin.roles]
            print(f"User: {admin.nombre}")
            print(f"Roles: {roles}")
            print(f"Active: {admin.activo}")
        else:
            print("Admin user not found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_admin_roles()
