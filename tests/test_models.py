import pytest
from sqlalchemy import inspect
from src.backend.models.base import Base

def test_model_tables_exist(engine):
    """Verify that all 48 models have corresponding tables in the database."""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # List of expected tables based on models/__init__.py
    expected_tables = [
        "usuario", "rol", "usuario_rol", "audit_trail", "revision", "operario",
        "sistema", "planta", "area", "tipo_equipo", "estado_equipo", "equipo_instrumento", "zona_equipo", "calibracion_calificacion_equipo", "historico_estado_equipo", "punto_muestreo",
        "producto", "especificacion", "metodo_version", "cepa_referencia",
        "estado_manufactura", "orden_manufactura", "manufactura", "manufactura_operario", "historico_estado_manufactura", "estado_solicitud", "solicitud_muestreo", "historico_solicitud_muestreo", "muestreo", "muestra", "envio_muestra", "recepcion", "estado_analisis", "analisis", "historial_estado_analisis", "incubacion", "resultado",
        "polvo_suplemento", "recepcion_polvo_suplemento", "stock_polvo_suplemento", "uso_polvo_suplemento", "medio_preparado", "orden_preparacion_medio", "estado_qc", "stock_medios", "aprobacion_medios", "uso_medios", "uso_cepa"
    ]
    
    for table in expected_tables:
        assert table in existing_tables, f"Table {table} not found in database"

def test_base_metadata_count():
    """Verify that the number of tables in metadata is correct."""
    # Based on the previous analysis, there should be around 48 tables.
    assert len(Base.metadata.tables) >= 48
