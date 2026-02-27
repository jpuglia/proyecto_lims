from typing import Dict, Type

from sqlalchemy.orm import Session

from src.backend.repositories.base import BaseRepository


class FKResolver:
    """
    Resuelve claves foráneas usando cache en memoria.
    Versión genérica y escalable.
    """

    def __init__(
        self,
        db: Session,
        config: Dict[str, Type[BaseRepository]],
        key_field: str = "codigo"
    ):
        """
        config ejemplo:

        {
            "sistema": SistemaRepository,
            "planta": PlantaRepository
        }
        """

        self._maps: Dict[str, Dict[str, int]] = {}

        self._load_all(db, config, key_field)

    # =========================
    # LOADER GENERAL
    # =========================

    def _load_all(
        self,
        db: Session,
        config: Dict[str, Type[BaseRepository]],
        key_field: str
    ) -> None:

        for name, repo_class in config.items():

            repo = repo_class()

            self._maps[name] = repo.get_column_map(
                db,
                key_field=key_field
            )

    # =========================
    # RESOLVER
    # =========================

    def get_id(self, table: str, key: str) -> int:
        """
        Devuelve el ID correspondiente a un valor textual.

        Ejemplo:
        get_id("planta", "PL01") → 5
        """

        if table not in self._maps:
            raise ValueError(
                f"Tabla no registrada en FKResolver: {table}"
            )

        table_map = self._maps[table]

        if key not in table_map:
            raise ValueError(
                f"Valor '{key}' no existe en '{table}'"
            )

        return table_map[key]
