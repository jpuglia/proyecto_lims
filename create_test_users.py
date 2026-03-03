from src.backend.database.db_manager import db_manager
from src.backend.models.auth import Usuario, Rol, UsuarioRol, Operario
from src.backend.models.master import Producto
from src.backend.models.dim import Planta
from src.backend.api.security import hash_password

def setup_users():
    db = db_manager.SessionLocal()
    try:
        # 1. Asegurar roles
        roles = ["administrador", "supervisor", "analista", "operador"]
        for r_name in roles:
            if not db.query(Rol).filter(Rol.nombre == r_name).first():
                db.add(Rol(nombre=r_name))
        db.commit()

        # 2. Crear Operador si no existe
        op = db.query(Usuario).filter(Usuario.nombre == 'operador').first()
        if not op:
            print("Creating operator user...")
            op = Usuario(
                nombre="operador",
                password_hash=hash_password("operador123"),
                firma="OPERADOR",
                activo=True
            )
            db.add(op)
            db.commit()
            print("Operator created.")

        # 3. Asignar rol operador
        rol_op = db.query(Rol).filter(Rol.nombre == 'operador').first()
        if op and rol_op:
            if not db.query(UsuarioRol).filter(UsuarioRol.usuario_id == op.usuario_id, UsuarioRol.rol_id == rol_op.rol_id).first():
                db.add(UsuarioRol(usuario_id=op.usuario_id, rol_id=rol_op.rol_id))
                db.commit()
                print("Role 'operador' assigned.")

        # 4. Crear Operarios (Entidad de negocio)
        if not db.query(Operario).filter(Operario.codigo_empleado == 'EMP001').first():
            db.add(Operario(nombre="Juan", apellido="Pérez", codigo_empleado="EMP001", activo=True))
        if not db.query(Operario).filter(Operario.codigo_empleado == 'EMP002').first():
            db.add(Operario(nombre="Ana", apellido="García", codigo_empleado="EMP002", activo=True))
        
        # 5. Asegurar Estados de Manufactura
        from src.backend.models.fact import EstadoManufactura
        estados_m = ["Planificado", "En Proceso", "Completado", "Cancelado"]
        for est_name in estados_m:
            if not db.query(EstadoManufactura).filter(EstadoManufactura.nombre == est_name).first():
                db.add(EstadoManufactura(nombre=est_name))
        db.commit()

        # 6. Asegurar Planta y Productos
        planta = db.query(Planta).first()
        if not planta:
            planta = Planta(codigo="PLT-TEST", nombre="Planta Test", sistema_id=1, activo=True)
            db.add(planta)
            db.commit()

        if not db.query(Producto).filter(Producto.codigo == 'PROD-001').first():
            db.add(Producto(codigo="PROD-001", nombre="Ibuprofeno 400mg", planta_id=planta.planta_id, activo=True))
        if not db.query(Producto).filter(Producto.codigo == 'PROD-002').first():
            db.add(Producto(codigo="PROD-002", nombre="Paracetamol 500mg", planta_id=planta.planta_id, activo=True))

        db.commit()
        print("Test data (Operarios & Productos) created.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_users()
