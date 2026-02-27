"""
seed_roles.py
─────────────
Inserta los roles base del sistema LIMS en la base de datos.
Y asigna el rol 'administrador' al usuario 'admin' si existe.

Uso:
    python seed_roles.py
"""
import sys
from pathlib import Path

# Asegurar que el proyecto raíz esté en el path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.backend.models.auth import Rol, UsuarioRol, Usuario

DATABASE_URL = "sqlite:///./lab_dev.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)

ROLES_BASE = [
    "administrador",
    "supervisor",
    "analista",
    "operador",
    "auditor",
]

def seed_roles():
    db = Session()
    try:
        roles_creados = []
        for nombre_rol in ROLES_BASE:
            existente = db.query(Rol).filter(Rol.nombre == nombre_rol).first()
            if not existente:
                rol = Rol(nombre=nombre_rol)
                db.add(rol)
                roles_creados.append(nombre_rol)

        db.commit()
        print(f"✅ Roles insertados: {roles_creados or 'ninguno nuevo (ya existían)'}")

        # Asignar rol 'administrador' al usuario 'admin' si no tiene ninguno
        admin_user = db.query(Usuario).filter(Usuario.nombre == "admin").first()
        if admin_user:
            ya_tiene_rol = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == admin_user.usuario_id).first()
            if not ya_tiene_rol:
                rol_admin = db.query(Rol).filter(Rol.nombre == "administrador").first()
                if rol_admin:
                    asignacion = UsuarioRol(
                        usuario_id=admin_user.usuario_id,
                        rol_id=rol_admin.rol_id,
                    )
                    db.add(asignacion)
                    db.commit()
                    print(f"✅ Rol 'administrador' asignado al usuario 'admin' (id={admin_user.usuario_id})")
            else:
                print(f"ℹ️  Usuario 'admin' ya tiene un rol asignado.")
        else:
            print("ℹ️  Usuario 'admin' no encontrado. Crea el usuario primero.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
