"""
Dependency injection for FastAPI.

Provides database sessions, repositories, and service instances
to route handlers via FastAPI's Depends() mechanism.
"""

from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends

from src.backend.database.db_manager import db_manager

# ─── Repositories ───────────────────────────────────────────────
from src.backend.repositories.auth import (
    UsuarioRepository, RolRepository, UsuarioRolRepository,
    AuditTrailRepository, RevisionRepository, OperarioRepository,
)
from src.backend.repositories.dim import (
    SistemaRepository, PlantaRepository, AreaRepository,
    TipoEquipoRepository, EstadoEquipoRepository, EquipoInstrumentoRepository,
    ZonaEquipoRepository, CalibracionCalificacionEquipoRepository,
    HistoricoEstadoEquipoRepository, PuntoMuestreoRepository,
)
from src.backend.repositories.master import (
    ProductoRepository, EspecificacionRepository,
    MetodoVersionRepository, CepaReferenciaRepository,
)
from src.backend.repositories.fact import (
    EstadoManufacturaRepository, OrdenManufacturaRepository, ManufacturaRepository,
    ManufacturaOperarioRepository, HistoricoEstadoManufacturaRepository,
    EstadoSolicitudRepository, SolicitudMuestreoRepository,
    HistoricoSolicitudMuestreoRepository,
    MuestreoRepository, MuestraRepository, EnvioMuestraRepository,
    RecepcionRepository, EstadoAnalisisRepository, AnalisisRepository,
    HistorialEstadoAnalisisRepository, IncubacionRepository, ResultadoRepository,
)
from src.backend.repositories.inventory import (
    PolvoSuplementoRepository, RecepcionPolvoSuplementoRepository,
    StockPolvoSuplementoRepository, UsoPolvoSuplementoRepository,
    MedioPreparadoRepository, OrdenPreparacionMedioRepository,
    EstadoQCRepository, StockMediosRepository, AprobacionMediosRepository,
    UsoMediosRepository, UsoCepaRepository,
)

# ─── Services ───────────────────────────────────────────────────
from src.backend.services.auth_service import AuthService
from src.backend.services.equipment_service import EquipmentService
from src.backend.services.manufacturing_service import ManufacturingService
from src.backend.services.sample_service import SampleService
from src.backend.services.analysis_service import AnalysisService
from src.backend.services.inventory_service import InventoryService


# ─── Database Session ──────────────────────────────────────────

def get_db() -> Generator[Session, None, None]:
    """Yield a database session per request."""
    yield from db_manager.get_session()


# ─── Service Factories ─────────────────────────────────────────

def get_auth_service() -> AuthService:
    return AuthService(
        usuario_repo=UsuarioRepository(),
        audit_repo=AuditTrailRepository(),
    )


def get_equipment_service() -> EquipmentService:
    return EquipmentService(
        equipo_repo=EquipoInstrumentoRepository(),
        historico_repo=HistoricoEstadoEquipoRepository(),
        estado_repo=EstadoEquipoRepository(),
    )


def get_manufacturing_service() -> ManufacturingService:
    return ManufacturingService(
        orden_repo=OrdenManufacturaRepository(),
        manufactura_repo=ManufacturaRepository(),
        historico_repo=HistoricoEstadoManufacturaRepository(),
        estado_repo=EstadoManufacturaRepository(),
    )


def get_sample_service() -> SampleService:
    return SampleService(
        solicitud_repo=SolicitudMuestreoRepository(),
        historico_solicitud_repo=HistoricoSolicitudMuestreoRepository(),
        muestreo_repo=MuestreoRepository(),
        muestra_repo=MuestraRepository(),
        envio_repo=EnvioMuestraRepository(),
        recepcion_repo=RecepcionRepository(),
    )


def get_analysis_service() -> AnalysisService:
    return AnalysisService(
        analisis_repo=AnalisisRepository(),
        estado_analisis_repo=EstadoAnalisisRepository(),
        historial_repo=HistorialEstadoAnalisisRepository(),
        incubacion_repo=IncubacionRepository(),
        resultado_repo=ResultadoRepository(),
        especificacion_repo=EspecificacionRepository(),
    )


def get_inventory_service() -> InventoryService:
    return InventoryService(
        recepcion_polvo_repo=RecepcionPolvoSuplementoRepository(),
        stock_polvo_repo=StockPolvoSuplementoRepository(),
        uso_polvo_repo=UsoPolvoSuplementoRepository(),
        orden_prep_repo=OrdenPreparacionMedioRepository(),
        stock_medios_repo=StockMediosRepository(),
        aprob_medios_repo=AprobacionMediosRepository(),
        estado_qc_repo=EstadoQCRepository(),
    )
