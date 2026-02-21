from src.backend.repositories import (
    sistema_repository as sistema,
    producto_repository as producto,
    planta_repository as planta,
    cepa_referencia_repository as cepa_ref,
    area_repository as area
)


REPOSITORY_REGISTRY = {

    "SistemaRepository": sistema.SistemaRepository,
    "PlantaRepository": planta.PlantaRepository,
    "AreaRepository": area.AreaRepository,
    "ProductoRepository": producto.ProductoRepository,
    "CepaRepository": cepa_ref.CepaRepository
}
