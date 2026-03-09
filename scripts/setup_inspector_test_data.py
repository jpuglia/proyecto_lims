from src.backend.database.db_manager import db_manager
from src.backend.models.auth import Usuario, Rol, UsuarioRol
from src.backend.api.security import hash_password

def setup_inspector():
    db = db_manager.SessionLocal()
    try:
        # 1. Asegurar rol 'inspector'
        rol_inspector = db.query(Rol).filter(Rol.nombre == "inspector").first()
        if not rol_inspector:
            print("Creating inspector role...")
            rol_inspector = Rol(nombre="inspector")
            db.add(rol_inspector)
            db.commit()
            print("Inspector role created.")
        else:
            print("Inspector role already exists.")

        # 2. Crear usuario 'inspector' si no existe
        inspector_user = db.query(Usuario).filter(Usuario.nombre == 'inspector').first()
        if not inspector_user:
            print("Creating inspector user...")
            inspector_user = Usuario(
                nombre="inspector",
                password_hash=hash_password("inspector123"),
                firma="INSPECTOR",
                activo=True
            )
            db.add(inspector_user)
            db.commit()
            print("Inspector user created.")
        else:
            print("Inspector user already exists.")

        # 3. Asignar rol inspector
        if not db.query(UsuarioRol).filter(UsuarioRol.usuario_id == inspector_user.usuario_id, UsuarioRol.rol_id == rol_inspector.rol_id).first():
            print("Assigning role 'inspector' to user...")
            db.add(UsuarioRol(usuario_id=inspector_user.usuario_id, rol_id=rol_inspector.rol_id))
            db.commit()
            print("Role assigned.")
        else:
            print("Role already assigned.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_inspector()
