# src/backend/repositories/analisis_repository.py

from src.backend.repositories.regulatory_repository import RegulatoryRepository
from src.backend.models.fact.analisis import Analisis


class AnalisisRepository(RegulatoryRepository[Analisis]):
    """
    Repository regulatorio para ANALISIS.

    - Audit trail automático
    - Soft delete obligatorio
    - Usuario ejecutor requerido
    - Delete físico prohibido
    """

    model = Analisis
