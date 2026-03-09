import sys; from pathlib import Path; from datetime import datetime, timedelta, timezone; sys.path.insert(0, str(Path(__file__).resolve().parent.parent)); from src.backend.database.db_manager import db_manager; from src.backend.models.auth import Usuario; from src.backend.models.fact import SolicitudMuestreo, EstadoSolicitud; db = db_manager.SessionLocal(); s5 = db.query(EstadoSolicitud).get(5); 
if not s5: db.add(EstadoSolicitud(estado_solicitud_id=5, nombre='Espera de Envio')); db.commit();
u = db.query(Usuario).filter_by(nombre='inspector').first();
if u: db.add(SolicitudMuestreo(usuario_id=u.usuario_id, tipo='Ambiental', fecha_limite=datetime.now(timezone.utc) + timedelta(hours=24), estado_solicitud_id=5, observacion='TEST WAITING SHIPMENT')); db.commit(); print('Fixed');
db.close()
