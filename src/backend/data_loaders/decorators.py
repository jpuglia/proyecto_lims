import csv
from functools import wraps
from typing import Type, Callable

from src.backend.database.db_manager import db_manager
from src.backend.repositories.base_repository import BaseRepository

from src.backend.data_loaders.resolvers import FKResolver


def csv_loader(repository_class: Type[BaseRepository]):


    def decorator(mapper_func: Callable):

        @wraps(mapper_func)
        def wrapper(file_path: str):

            repo = repository_class()

            ok = 0
            error = 0

            for db in db_manager.get_session():

                # Crear resolver UNA vez
                resolver = FKResolver(db)

                with open(file_path, newline="", encoding="utf-8") as f:

                    reader = csv.DictReader(f)

                    for i, row in enumerate(reader, 1):

                        try:

                            data = mapper_func(row, resolver)

                            if not data:
                                continue

                            repo.create(db, data)

                            ok += 1


                        except Exception as e:

                            error += 1

                            print(f"[ERROR] Fila {i}: {e}")


                print(f"[IMPORT] OK={ok} | ERR={error}")


        return wrapper

    return decorator
