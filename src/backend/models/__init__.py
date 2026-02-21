# Export all models for easy importing and for SQLAlchemy metadata detection
from src.backend.models.base import Base

from src.backend.models.auth import Usuario, Rol, UsuarioRol, AuditTrail, Revision, Operario
from src.backend.models.dim import Sistema, Planta, Area, TipoEquipo, EstadoEquipo, EquipoInstrumento, ZonaEquipo, CalibracionCalificacionEquipo, HistoricoEstadoEquipo, PuntoMuestreo
from src.backend.models.master import Producto, Especificacion, MetodoVersion, CepaReferencia
from src.backend.models.fact import EstadoManufactura, OrdenManufactura, Manufactura, ManufacturaOperario, HistoricoEstadoManufactura, EstadoSolicitud, SolicitudMuestreo, HistoricoSolicitudMuestreo, Muestreo, Muestra, EnvioMuestra, Recepcion, EstadoAnalisis, Analisis, HistorialEstadoAnalisis, Incubacion, Resultado
from src.backend.models.inventory import PolvoSuplemento, RecepcionPolvoSuplemento, StockPolvoSuplemento, UsoPolvoSuplemento, MedioPreparado, OrdenPreparacionMedio, EstadoQC, StockMedios, AprobacionMedios, UsoMedios, UsoCepa

__all__ = [
    "Base",
    "Usuario", "Rol", "UsuarioRol", "AuditTrail", "Revision", "Operario",
    "Sistema", "Planta", "Area", "TipoEquipo", "EstadoEquipo", "EquipoInstrumento", "ZonaEquipo", "CalibracionCalificacionEquipo", "HistoricoEstadoEquipo", "PuntoMuestreo",
    "Producto", "Especificacion", "MetodoVersion", "CepaReferencia",
    "EstadoManufactura", "OrdenManufactura", "Manufactura", "ManufacturaOperario", "HistoricoEstadoManufactura", "EstadoSolicitud", "SolicitudMuestreo", "HistoricoSolicitudMuestreo", "Muestreo", "Muestra", "EnvioMuestra", "Recepcion", "EstadoAnalisis", "Analisis", "HistorialEstadoAnalisis", "Incubacion", "Resultado",
    "PolvoSuplemento", "RecepcionPolvoSuplemento", "StockPolvoSuplemento", "UsoPolvoSuplemento", "MedioPreparado", "OrdenPreparacionMedio", "EstadoQC", "StockMedios", "AprobacionMedios", "UsoMedios", "UsoCepa"
]
