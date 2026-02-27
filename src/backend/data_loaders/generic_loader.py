import csv
from typing import Dict, Any, Callable

from sqlalchemy.orm import Session

from src.backend.data_loaders.resolvers import FKResolver


def generic_csv_loader(config: Dict[str, Any]) -> Callable[[str], None]:
    """
    Loader universal con soporte FK.
    """

    repo_class = config["repo"]

    fks_config = config.get("fks", {})

    unique_field = config.get("unique_field", "codigo")


    def loader(csv_path: str, db: Session) -> None:
        """
        Ejecuta la carga para un archivo específico usando la sesión provista.
        """
        repo = repo_class()
        model_columns = {c.name for c in repo.model.__table__.columns}

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

        delimiter = config.get("delimiter", ",")
        mapping = config.get("mappings", {})
        encoding = config.get("encoding", "utf-8")

        import unicodedata
        import re

        def normalize(s):
            if not s: return ""
            # Normalizar a NFC, quitar acentos, pasar a minúsculas y quitar no-alfanuméricos
            s = str(s)
            s = unicodedata.normalize('NFD', s)
            s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
            s = s.lower()
            return re.sub(r'[^a-z0-9]', '', s)

        # Pre-normalizar mappings
        norm_mapping = {normalize(k): v for k, v in mapping.items()}

        with open(csv_path, newline="", encoding=encoding) as f:

            reader = csv.DictReader(f, delimiter=delimiter)
            
            # Limpiar nombres de columnas del CSV (manejo de BOM o espacios)
            def clean_header(h):
                if not h: return h
                # Quitar BOM y otros caracteres invisibles comunes
                h = h.strip().replace('\ufeff', '').replace('\xef\xbb\xbf', '').replace('\xff\xfe', '').replace('\xfe\xff', '')
                return h

            reader.fieldnames = [clean_header(fn) for fn in reader.fieldnames]

            for row_idx, row in enumerate(reader, 1):
                try:
                    raw_data = {clean_header(k): v for k, v in row.items()}
                    # Diccionario de claves normalizadas para búsqueda rápida
                    norm_raw = {normalize(k): k for k in raw_data.keys()}
                    
                    if row_idx == 1:
                        pass # Debug info removed

                    data = {}

                    # ----------------------------
                    # Mapeo de campos (Fuzzy)
                    # ----------------------------
                    
                    if mapping:
                        for norm_key, db_targets in norm_mapping.items():
                            if norm_key in norm_raw:
                                csv_col = norm_raw[norm_key]
                                val = raw_data[csv_col]
                                if isinstance(db_targets, str):
                                    data[db_targets] = val
                                elif isinstance(db_targets, list):
                                    for target in db_targets:
                                        data[target] = val

                    pk_columns = {c.name for c in repo.model.__table__.primary_key}

                    # Complementar con datos originales
                    for k, v in raw_data.items():
                        # Si la columna ya fue llenada por un mapping, no pisarla
                        # Y no mapear automáticamente la PK para evitar conflictos de tipos
                        if k in model_columns and k not in data and k not in pk_columns:
                            data[k] = v

                    # ----------------------------
                    # Resolver FK (Fuzzy)
                    # ----------------------------

                    if resolver:
                        for csv_field, fk_cfg in fks_config.items():
                            norm_field = normalize(csv_field)
                            if norm_field in norm_raw:
                                csv_col = norm_raw[norm_field]
                                value = raw_data[csv_col]
                                
                                if not value or value.strip() == "":
                                    continue

                                fk_id = resolver.get_id(
                                    fk_cfg["table"],
                                    value
                                )

                                db_field = fk_cfg.get("target_field")
                                if not db_field:
                                    # Fallback
                                    db_field = csv_col.replace("_codigo", "_id")
                                    if db_field not in model_columns:
                                        db_field = f"{fk_cfg['table']}_id"

                                data[db_field] = fk_id

                    # ----------------------------
                    # Valores por defecto
                    # ----------------------------
                    defaults = config.get("defaults", {})
                    for field, def_val in defaults.items():
                        if field not in data or data[field] is None or data[field] == "":
                            data[field] = def_val

                    # ----------------------------
                    # Filtrar solo campos válidos para el modelo
                    # ----------------------------
                    final_data = {k: v for k, v in data.items() if k in model_columns}

                    if row_idx == 1:
                        pass # Final Data debug removed

                    # ----------------------------
                    # Manejo especial de Nombres (Operario)
                    # ----------------------------

                    if repo.model.__name__ == "Operario":
                        if "nombre" in final_data and "apellido" not in final_data:
                            partes = final_data["nombre"].split(" ", 1)
                            if len(partes) > 1:
                                final_data["nombre"] = partes[0]
                                final_data["apellido"] = partes[1]
                            else:
                                final_data["apellido"] = "."

                    # ----------------------------
                    # UPSERT
                    # ----------------------------

                    key_value = final_data.get(unique_field)
                    if key_value is None:
                        # Si no hay valor para el campo único, no podemos hacer UPSERT
                        # Intentar crear igual o saltar
                        repo.create(db, final_data)
                        continue

                    existing = repo.get_by_filters(
                        db,
                        **{unique_field: key_value}
                    )

                    if existing:
                        repo.update(db, existing[0], final_data)
                    else:
                        repo.create(db, final_data)

                except Exception as e:
                    print(f"Error en fila {row_idx} de {csv_path}: {str(e)}")
                    # Importante: No silenciar el error si queremos que falle el pipeline
                    raise

    return loader
