# Export all repositories
from src.backend.repositories.base import BaseRepository

from src.backend.repositories.auth import (UsuarioRepository, RolRepository, UsuarioRolRepository,
                                           AuditTrailRepository, RevisionRepository, OperarioRepository)
from src.backend.repositories.dim import (SistemaRepository, PlantaRepository, AreaRepository,
                                          TipoEquipoRepository, EstadoEquipoRepository, EquipoInstrumentoRepository,
                                          ZonaEquipoRepository, CalibracionCalificacionEquipoRepository,
                                          HistoricoEstadoEquipoRepository, PuntoMuestreoRepository)
from src.backend.repositories.master import (ProductoRepository, EspecificacionRepository,
                                             MetodoVersionRepository, CepaReferenciaRepository)
from src.backend.repositories.fact import (EstadoManufacturaRepository, OrdenManufacturaRepository, ManufacturaRepository,
                                           ManufacturaOperarioRepository, HistoricoEstadoManufacturaRepository,
                                           EstadoSolicitudRepository, SolicitudMuestreoRepository, HistoricoSolicitudMuestreoRepository,
                                           MuestreoRepository, MuestraRepository, EnvioMuestraRepository, RecepcionRepository,
                                           EstadoAnalisisRepository, AnalisisRepository, HistorialEstadoAnalisisRepository,
                                           IncubacionRepository, ResultadoRepository)
from src.backend.repositories.inventory import (PolvoSuplementoRepository, RecepcionPolvoSuplementoRepository,
                                                StockPolvoSuplementoRepository, UsoPolvoSuplementoRepository,
                                                MedioPreparadoRepository, OrdenPreparacionMedioRepository,
                                                EstadoQCRepository, StockMediosRepository, AprobacionMediosRepository,
                                                UsoMediosRepository, UsoCepaRepository)
