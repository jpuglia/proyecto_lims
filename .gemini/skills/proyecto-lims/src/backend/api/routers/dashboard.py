"""Dashboard router – aggregated stats for the main panel."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
import sqlalchemy as sa
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.api.security import get_current_user
from src.backend.models.dim import EquipoInstrumento
from src.backend.models.fact import Analisis, SolicitudMuestreo, EstadoAnalisis

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retorna conteos reales y datos para gráficos:
    - equipos_activos, analisis_pendientes, muestras_hoy (KPIs)
    - analisis_por_estado: [{estado, count}] para gráfico de barras
    - muestras_semana: [{fecha, count}] últimos 7 días para line chart
    """
    equipos_activos = db.query(sa.func.count(EquipoInstrumento.equipo_instrumento_id)).scalar() or 0

    analisis_pendientes = db.query(sa.func.count(Analisis.analisis_id)).scalar() or 0

    hoy = date.today()
    muestras_hoy = (
        db.query(sa.func.count(SolicitudMuestreo.solicitud_muestreo_id))
        .filter(sa.func.date(SolicitudMuestreo.fecha) == hoy)
        .scalar()
        or 0
    )

    # ─── Chart data: Análisis agrupados por estado ────────────
    analisis_por_estado_rows = (
        db.query(EstadoAnalisis.nombre, sa.func.count(Analisis.analisis_id))
        .outerjoin(Analisis, Analisis.estado_analisis_id == EstadoAnalisis.estado_analisis_id)
        .group_by(EstadoAnalisis.nombre)
        .all()
    )
    analisis_por_estado = [
        {"estado": row[0], "count": row[1]} for row in analisis_por_estado_rows
    ]

    # ─── Chart data: Muestras por día (últimos 7 días) ────────
    muestras_semana = []
    for i in range(6, -1, -1):
        dia = hoy - timedelta(days=i)
        count = (
            db.query(sa.func.count(SolicitudMuestreo.solicitud_muestreo_id))
            .filter(sa.func.date(SolicitudMuestreo.fecha) == dia)
            .scalar()
            or 0
        )
        muestras_semana.append({"fecha": dia.isoformat(), "count": count})

    return {
        "equipos_activos": equipos_activos,
        "analisis_pendientes": analisis_pendientes,
        "muestras_hoy": muestras_hoy,
        "analisis_por_estado": analisis_por_estado,
        "muestras_semana": muestras_semana,
    }
