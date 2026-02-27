from src.backend.repositories.auth import UsuarioRepository, OperarioRepository
from src.backend.repositories.dim import (SistemaRepository, PlantaRepository, AreaRepository,
                                           EstadoEquipoRepository, EquipoInstrumentoRepository,
                                           PuntoMuestreoRepository)
from src.backend.repositories.master import (ProductoRepository, EspecificacionRepository,
                                              MetodoVersionRepository, CepaReferenciaRepository)
from src.backend.repositories.inventory import (EstadoQCRepository, MedioPreparadoRepository)

REPOSITORY_REGISTRY = {
    "SistemaRepository": SistemaRepository,
    "PlantaRepository": PlantaRepository,
    "AreaRepository": AreaRepository,
    "EstadoEquipoRepository": EstadoEquipoRepository,
    "EquipoRepository": EquipoInstrumentoRepository,  # Alias for matching pipeline.json
    "PuntoMuestreoRepository": PuntoMuestreoRepository,
    "ProductoRepository": ProductoRepository,
    "EspecificacionRepository": EspecificacionRepository,
    "MetodoVersionRepository": MetodoVersionRepository,
    "CepaRepository": CepaReferenciaRepository,  # Alias for matching pipeline.json
    "EstadoQCRepository": EstadoQCRepository,
    "UsuarioRepository": UsuarioRepository,
    "OperarioRepository": OperarioRepository,
    "MedioPreparadoRepository": MedioPreparadoRepository
}
