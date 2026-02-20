import csv
from typing import Dict, Any, Callable

from sqlalchemy.orm import Session

from src.backend.database.db_manager import db_manager
from src.backend.data_loaders.resolvers import FKResolver


def generic_csv_loader(config: Dict[str, Any]) -> Callable[[str], None]:
    """
    Loader universal con soporte FK.
    """

    repo_class = config["repo"]

    fks_config = config.get("fks", {})

    unique_field = config.get("unique_field", "codigo")


    def loader(csv_path: str) -> None:

        repo = repo_class()

        with next(db_manager.get_session()) as db:

            # --------------------------------
            # Inicializar resolver si hay FK
            # --------------------------------

            resolver = None

            if fks_config:

                resolver = FKResolver(
                    db,
                    {
                        fk["table"]: fk["repo"]
                        for fk in fks_config.values()
                    }
                )

            # --------------------------------
            # Leer CSV
            # --------------------------------

            with open(csv_path, newline="", encoding="utf-8") as f:

                reader = csv.DictReader(f)

                for row in reader:

                    data = dict(row)

                    # ----------------------------
                    # Resolver FK
                    # ----------------------------

                    if resolver:

                        for csv_field, fk_cfg in fks_config.items():

                            value = data.pop(csv_field)

                            fk_id = resolver.get_id(
                                fk_cfg["table"],
                                value
                            )

                            db_field = csv_field.replace(
                                "_codigo",
                                "_id"
                            )

                            data[db_field] = fk_id

                    # ----------------------------
                    # UPSERT
                    # ----------------------------

                    key_value = data[unique_field]

                    existing = repo.get_by_filters(
                        db,
                        **{unique_field: key_value}
                    )

                    if existing:
                        repo.update(db, existing[0], data)
                    else:
                        repo.create(db, data)

    return loader
