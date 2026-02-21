from src.backend.repositories.base_repository import BaseRepository
from src.backend.models.auth.usuario import Usuario

class UsuarioRepository(BaseRepository[Usuario]):

    model = Usuario