import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.backend.models.base import Base
import src.backend.models as models
from src.backend.api.app import app
from src.backend.api.dependencies import get_db
from src.backend.api.security import hash_password
from src.backend.models.auth import Usuario, Rol, UsuarioRol
from src.backend.models.fact import EstadoSolicitud, EstadoAnalisis, EstadoManufactura
from src.backend.models.dim import Sistema, Planta, Area, TipoSolicitudMuestreo

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="function")
def db_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def _create_test_user_with_role(db_session, rol_nombre: str) -> Usuario:
    rol = db_session.query(Rol).filter(Rol.nombre == rol_nombre).first()
    if not rol:
        rol = Rol(nombre=rol_nombre)
        db_session.add(rol)
        db_session.flush()

    username = f"test_{rol_nombre}_fixture"
    user = db_session.query(Usuario).filter(Usuario.nombre == username).first()
    if not user:
        user = Usuario(
            nombre=username,
            password_hash=hash_password("testpassword123"),
            firma="T.F.",
            activo=True,
        )
        db_session.add(user)
        db_session.flush()

        asignacion = UsuarioRol(usuario_id=user.usuario_id, rol_id=rol.rol_id)
        db_session.add(asignacion)
        db_session.commit()
        db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def auth_client(db_session):
    from src.backend.api.security import get_current_user
    def override_get_db():
        yield db_session
    test_user = _create_test_user_with_role(db_session, "administrador")
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def supervisor_client(db_session):
    from src.backend.api.security import get_current_user
    def override_get_db():
        yield db_session
    test_user = _create_test_user_with_role(db_session, "supervisor")
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def operador_client(db_session):
    from src.backend.api.security import get_current_user
    def override_get_db():
        yield db_session
    test_user = _create_test_user_with_role(db_session, "operador")
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def seed_data(db_session):
    # Tipos Solicitud
    tipos = [
        ("AIRE_AREA", "Aire área", "Ambiental"),
        ("AIRE_EQUIPO", "Aire equipo", "Equipo"),
        ("HISOPADO_PERSONAL", "Hisopado personal", "Personal"),
        ("HISOPADO_EQUIPO", "Hisopado equipo", "Equipo"),
        ("HISOPADO_SUPERFICIE", "Hisopado superficie", "Superficie"),
        ("PRODUCTO", "Producto", "Producto"),
        ("AGUA", "Agua", "Servicio"),
        ("NITROGENO", "Nitrógeno", "Servicio"),
        ("AIRE_COMPRIMIDO", "Aire comprimido", "Servicio"),
    ]
    for cod, desc, cat in tipos:
        if not db_session.query(TipoSolicitudMuestreo).filter_by(codigo=cod).first():
            db_session.add(TipoSolicitudMuestreo(codigo=cod, descripcion=desc, categoria=cat, activo=True))

    # Estados Solicitud
    if not db_session.query(EstadoSolicitud).filter_by(estado_solicitud_id=1).first():
        db_session.add(EstadoSolicitud(estado_solicitud_id=1, nombre="Pendiente"))
    if not db_session.query(EstadoSolicitud).filter_by(estado_solicitud_id=2).first():
        db_session.add(EstadoSolicitud(estado_solicitud_id=2, nombre="En Muestreo"))
    if not db_session.query(EstadoSolicitud).filter_by(estado_solicitud_id=3).first():
        db_session.add(EstadoSolicitud(estado_solicitud_id=3, nombre="Completado"))
    
    # Estados Analisis
    if not db_session.query(EstadoAnalisis).filter_by(estado_analisis_id=1).first():
        db_session.add(EstadoAnalisis(estado_analisis_id=1, nombre="Pendiente"))
    if not db_session.query(EstadoAnalisis).filter_by(estado_analisis_id=2).first():
        db_session.add(EstadoAnalisis(estado_analisis_id=2, nombre="En Curso"))
    if not db_session.query(EstadoAnalisis).filter_by(estado_analisis_id=3).first():
        db_session.add(EstadoAnalisis(estado_analisis_id=3, nombre="Finalizado"))

    # Locations
    if not db_session.query(Sistema).filter_by(sistema_id=1).first():
        db_session.add(Sistema(sistema_id=1, codigo="SIS-001", nombre="Sistema General"))
    
    db_session.flush() # Ensure sistema_id=1 is available

    if not db_session.query(Planta).filter_by(planta_id=1).first():
        db_session.add(Planta(planta_id=1, codigo="PLT-001", nombre="Planta Central", sistema_id=1))
    
    db_session.flush()

    if not db_session.query(Area).filter_by(area_id=1).first():
        db_session.add(Area(area_id=1, nombre="Laboratorio", planta_id=1))

    db_session.commit()
    return True
