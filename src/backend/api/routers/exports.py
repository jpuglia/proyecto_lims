import io
import csv
from typing import List, Any, Dict
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.api.security import get_current_user
from src.backend.models.auth import Usuario
from src.backend.models.dim import EquipoInstrumento, Planta
from src.backend.models.fact import OrdenManufactura, EstadoManufactura


from src.backend.models.audit import AuditLog


router = APIRouter()


@router.get("/audit.csv")
def export_audit_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Descarga el registro de auditoría (Audit Trail) en formato CSV."""
    logs = db.query(AuditLog).order_by(AuditLog.fecha.desc()).all()
    
    data = []
    for log in logs:
        data.append({
            "ID Log": log.audit_log_id,
            "Tabla": log.tabla_nombre,
            "Registro ID": log.registro_id,
            "Operacion": log.operacion,
            "Usuario ID": log.usuario_id,
            "Fecha": log.fecha.strftime("%Y-%m-%d %H:%M:%S"),
            "Valor Anterior": str(log.valor_anterior)[:100] + "..." if log.valor_anterior else "",
            "Valor Nuevo": str(log.valor_nuevo)[:100] + "..." if log.valor_nuevo else ""
        })

    fieldnames = ["ID Log", "Tabla", "Registro ID", "Operacion", "Usuario ID", "Fecha", "Valor Anterior", "Valor Nuevo"]
    
    return StreamingResponse(
        _generate_csv(data, fieldnames),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit-trail.csv"}
    )


def _generate_csv(data: List[Dict[str, Any]], fieldnames: List[str]) -> str:
    """Helper generator to stream CSV rows."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, delimiter=';')
    
    # Write header
    writer.writeheader()
    yield output.getvalue()
    output.seek(0)
    output.truncate(0)

    # Write data
    for row in data:
        writer.writerow(row)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)


@router.get("/equipos.csv")
def export_equipos_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Descarga lista de equipos en formato CSV."""
    equipos = db.query(EquipoInstrumento).all()
    
    data = []
    for eq in equipos:
        data.append({
            "ID": eq.equipo_instrumento_id,
            "Codigo": eq.codigo,
            "Nombre": eq.nombre,
            "Area ID": eq.area_id,
            "Tipo ID": eq.tipo_equipo_id,
            "Estado ID": eq.estado_equipo_id
        })

    fieldnames = ["ID", "Codigo", "Nombre", "Area ID", "Tipo ID", "Estado ID"]
    
    return StreamingResponse(
        _generate_csv(data, fieldnames),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=equipos.csv"}
    )


@router.get("/plantas.csv")
def export_plantas_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Descarga lista de plantas en formato CSV."""
    plantas = db.query(Planta).all()
    
    data = []
    for pl in plantas:
        data.append({
            "ID": pl.planta_id,
            "Codigo": pl.codigo,
            "Nombre": pl.nombre,
            "Sistema ID": pl.sistema_id,
            "Activo": "Sí" if pl.activo else "No"
        })

    fieldnames = ["ID", "Codigo", "Nombre", "Sistema ID", "Activo"]
    
    return StreamingResponse(
        _generate_csv(data, fieldnames),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=plantas.csv"}
    )


@router.get("/ordenes-manufactura.csv")
def export_ordenes_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Descarga lista de órdenes de manufactura en formato CSV."""
    ordenes = db.query(OrdenManufactura).all()
    
    data = []
    for ord in ordenes:
        data.append({
            "ID": ord.orden_manufactura_id,
            "Codigo": ord.codigo,
            "Lote Salida": ord.lote,
            "Fecha": ord.fecha.strftime("%Y-%m-%d") if ord.fecha else "",
            "Producto ID": ord.producto_id,
            "Cantidad": ord.cantidad,
            "Unidad": ord.unidad,
            "Operario Asignado ID": ord.operario_id
        })

    fieldnames = ["ID", "Codigo", "Lote Salida", "Fecha", "Producto ID", "Cantidad", "Unidad", "Operario Asignado ID"]
    
    return StreamingResponse(
        _generate_csv(data, fieldnames),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ordenes-manufactura.csv"}
    )
