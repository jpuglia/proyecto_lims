from src.backend.repositories.base import BaseRepository
from src.backend.models.audit import AuditLog

class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self):
        super().__init__(AuditLog)
