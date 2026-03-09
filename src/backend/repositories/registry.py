from src.backend.repositories.auth import UsuarioRepository, OperarioRepository
from src.backend.repositories.dim import (SistemaRepository, PlantaRepository, AreaRepository,
                                           EstadoEquipoRepository, EquipoInstrumentoRepository,
                                           PuntoMuestreoRepository, TipoSolicitudMuestreoRepository)
from src.backend.repositories.master import (ProductoRepository, EspecificacionRepository,
                                              MetodoVersionRepository, CepaReferenciaRepository)
from src.backend.repositories.inventory import (EstadoQCRepository, MedioPreparadoRepository, PolvoSuplementoRepository)
from src.backend.repositories.fact import (OrdenManufacturaRepository, ManufacturaRepository)

REPOSITORY_REGISTRY = {
    "SistemaRepository": SistemaRepository,
    "PlantaRepository": PlantaRepository,
    "AreaRepository": AreaRepository,
    "EstadoEquipoRepository": EstadoEquipoRepository,
    "EquipoRepository": EquipoInstrumentoRepository,
    "EquipoInstrumentoRepository": EquipoInstrumentoRepository,
    "PuntoMuestreoRepository": PuntoMuestreoRepository,
    "ProductoRepository": ProductoRepository,
    "EspecificacionRepository": EspecificacionRepository,
    "MetodoVersionRepository": MetodoVersionRepository,
    "CepaRepository": CepaReferenciaRepository,  # Alias for matching pipeline.json
    "CepaReferenciaRepository": CepaReferenciaRepository,
    "EstadoQCRepository": EstadoQCRepository,
    "UsuarioRepository": UsuarioRepository,
    "OperarioRepository": OperarioRepository,
    "MedioPreparadoRepository": MedioPreparadoRepository,
    "PolvoSuplementoRepository": PolvoSuplementoRepository,
    "OrdenManufacturaRepository": OrdenManufacturaRepository,
    "ManufacturaRepository": ManufacturaRepository,
    "TipoSolicitudMuestreoRepository": TipoSolicitudMuestreoRepository
}
