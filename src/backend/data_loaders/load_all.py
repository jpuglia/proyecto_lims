import os
import json

from src.backend.data_loaders.pipeline_runner import run_pipeline
from src.backend.data_loaders.generic_loader import generic_csv_loader

from src.backend.repositories.registry import REPOSITORY_REGISTRY


CONFIG_PATH = "./config/pipeline.json"


def main():

    # ------------------------
    # Cargar JSON
    # ------------------------

    with open(CONFIG_PATH, encoding="utf-8") as f:
        config = json.load(f)

    data_dir = config["data_dir"]

    jobs = []

    # ------------------------
    # Construir pipelines
    # ------------------------

    for item in config["pipelines"]:

        repo_name = item["repo"]

        if repo_name not in REPOSITORY_REGISTRY:
            raise ValueError(f"Repo no registrado: {repo_name}")

        item["repo"] = REPOSITORY_REGISTRY[repo_name]

        # Resolver FK repos
        if "fks" in item:

            for fk in item["fks"].values():

                repo_fk = fk["repo"]

                if repo_fk not in REPOSITORY_REGISTRY:
                    raise ValueError(
                        f"Repo FK no registrado: {repo_fk}"
                    )

                fk["repo"] = REPOSITORY_REGISTRY[repo_fk]

        path = os.path.join(data_dir, item["csv"])

        loader = generic_csv_loader(item)

        jobs.append(
            (item["name"], loader, path)
        )

    # ------------------------
    # Ejecutar
    # ------------------------

    run_pipeline(jobs)


if __name__ == "__main__":
    main()
