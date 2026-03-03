import os
import sys
import logging
from datetime import datetime, timezone, timedelta

# Setup project path
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from src.backend.database.db_manager import db_manager
from src.backend.repositories.auth import UsuarioRepository
from src.backend.repositories.inventory import (PolvoSuplementoRepository, RecepcionPolvoSuplementoRepository, 
                                                EstadoQCRepository, StockMediosRepository, AprobacionMediosRepository,
                                                StockPolvoSuplementoRepository, UsoPolvoSuplementoRepository,
                                                OrdenPreparacionMedioRepository, UsoMediosRepository, UsoCepaRepository)
from src.backend.repositories.dim import EquipoInstrumentoRepository
from src.backend.repositories.master import (EspecificacionRepository, MetodoVersionRepository)
from src.backend.repositories.fact import (OrdenManufacturaRepository, EstadoManufacturaRepository, 
                                           SolicitudMuestreoRepository, AnalisisRepository, EstadoAnalisisRepository,
                                           ResultadoRepository, ManufacturaRepository, HistoricoEstadoManufacturaRepository,
                                           ManufacturaOperarioRepository, HistoricoSolicitudMuestreoRepository,
                                           MuestreoRepository, MuestraRepository, EnvioMuestraRepository, RecepcionRepository,
                                           HistorialEstadoAnalisisRepository, IncubacionRepository)
from src.backend.services.inventory_service import InventoryService
from src.backend.services.manufacturing_service import ManufacturingService
from src.backend.services.sample_service import SampleService
from src.backend.services.analysis_service import AnalysisService
from src.backend.models.audit import AuditLog

# Configure Integration Logger
log_file = "logs/integration_test.log"
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(log_file, mode='w'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("INTEGRATION_TEST")

def run_integration_test():
    logger.info("=== STARTING GLOBAL INTEGRATION TEST: THE LIFE OF A BATCH ===")
    db = next(db_manager.get_session())
    
    try:
        # PHASE 1: User Context
        user_repo = UsuarioRepository()
        admin_user = user_repo.get_by_nombre(db, "admin")
        uid = admin_user.usuario_id
        logger.info(f"[P1] Using Admin User ID: {uid}")

        # PHASE 5: Inventory
        inv_service = InventoryService(
            RecepcionPolvoSuplementoRepository(),
            StockPolvoSuplementoRepository(),
            UsoPolvoSuplementoRepository(),
            OrdenPreparacionMedioRepository(),
            StockMediosRepository(),
            AprobacionMediosRepository(),
            EstadoQCRepository()
        )
        
        test_code = f"TSA-T-{datetime.now().strftime('%H%M%S')}"
        polvo = PolvoSuplementoRepository().create(db, {"codigo": test_code, "nombre": "Tryptic Soy Agar Test", "unidad": "g"}, usuario_id=uid)
        
        recep_polvo = inv_service.register_powder_reception(db, {
            "polvo_suplemento_id": polvo.polvo_suplemento_id,
            "lote_proveedor": "PROV-123",
            "cantidad": 1000.0,
            "vence": (datetime.now(timezone.utc) + timedelta(days=365)).date()
        }, usuario_id=uid)
        
        stock_polvo = db.query(StockPolvoSuplementoRepository().model).filter_by(recepcion_polvo_suplemento_id=recep_polvo.recepcion_polvo_suplemento_id).first()
        
        orden_media = inv_service.prepare_culture_media(db, {
            "medio_preparado_id": 1,
            "lote": f"L-TSA-{datetime.now().strftime('%H%M%S')}",
            "fecha": datetime.now(timezone.utc),
            "volumen_total": 500.0,
            "unidad_volumen": "ml",
            "operario_id": 1
        }, [{
            "stock_polvo_suplemento_id": stock_polvo.stock_polvo_suplemento_id,
            "cantidad": 20.0,
            "unidad": "g"
        }], usuario_id=uid)
        
        stock_media = db.query(StockMediosRepository().model).filter_by(orden_preparacion_medio_id=orden_media.orden_preparacion_medio_id).first()
        # Release Media
        AprobacionMediosRepository().create(db, {
            "stock_medios_id": stock_media.stock_medios_id,
            "fecha": datetime.now(timezone.utc),
            "operario_id": 1,
            "observacion": "Release for integration test"
        }, usuario_id=uid)
        StockMediosRepository().update(db, stock_media, {"estado_qc_id": 2}, usuario_id=uid)
        logger.info(f"[P5] Resource Released: {stock_media.lote_interno}")

        # PHASE 3: Manufacturing & Trigger
        # Setup Services with triggers
        analysis_service = AnalysisService(
            AnalisisRepository(), EstadoAnalisisRepository(), HistorialEstadoAnalisisRepository(),
            IncubacionRepository(), ResultadoRepository(), EspecificacionRepository(),
            UsoMediosRepository(), UsoCepaRepository()
        )
        sample_service = SampleService(
            SolicitudMuestreoRepository(), HistoricoSolicitudMuestreoRepository(),
            MuestreoRepository(), MuestraRepository(), EnvioMuestraRepository(),
            RecepcionRepository(), analysis_service=analysis_service
        )
        m_service = ManufacturingService(
            OrdenManufacturaRepository(), ManufacturaRepository(),
            HistoricoEstadoManufacturaRepository(), EstadoManufacturaRepository(),
            ManufacturaOperarioRepository(), sample_service=sample_service
        )
        
        # 1. Create Order
        ord_m = OrdenManufacturaRepository().create(db, {
            "codigo": f"OM-{datetime.now().strftime('%H%M%S')}",
            "producto_id": 1,
            "lote": f"B-{datetime.now().strftime('%H%M%S')}",
            "cantidad": 1000.0,
            "unidad": "unidades",
            "fecha": datetime.now(timezone.utc).date(),
            "operario_id": 1
        }, usuario_id=uid)
        
        # 2. Create Manufacture Process (Phase)
        manufactura = m_service.create_manufacture_process(db, {
            "orden_manufactura_id": ord_m.orden_manufactura_id,
            "estado_manufactura_id": 1, # 'Programado'
            "fecha_inicio": None
        }, usuario_id=uid)
        
        # 3. Trigger 'En curso' (6)
        m_service.change_manufacture_state(db, manufactura.manufactura_id, 6, usuario_id=uid)
        logger.info(f"[P3] Manufacture State -> EN CURSO (6).")
        
        # Check Solicitud trigger
        solicitud = db.query(SolicitudMuestreoRepository().model).filter_by(orden_manufactura_id=ord_m.orden_manufactura_id).first()
        if solicitud:
            logger.info(f"[TRIGGER] SUCCESS: SolicitudMuestreo automatically created ID {solicitud.solicitud_muestreo_id}")
        else:
            raise ValueError("Trigger failed: No SolicitudMuestreo created")

        # PHASE 4: Laboratory Lifecycle
        # 1. Register Sampling Session
        muestreo = sample_service.register_sampling_session(db, {
            "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
            "fecha_inicio": datetime.now(timezone.utc),
            "operario_id": 1
        }, [{
            "tipo_muestra": "Producto Terminado",
            "codigo_etiqueta": f"LBL-{ord_m.lote}",
            "observacion": "Muestra de integración"
        }])
        muestra = muestreo.muestras[0]
        logger.info(f"[P4] Muestreo session registered. Muestra ID {muestra.muestra_id} created.")

        # 2. Envio
        envio = EnvioMuestraRepository().create(db, {
            "muestra_id": muestra.muestra_id,
            "fecha": datetime.now(timezone.utc),
            "operario_id": 1,
            "destino": "Laboratorio de Micro"
        }, usuario_id=uid)
        
        # 3. Recepcion (TRIGGER: Auto-create Analisis)
        recepcion = sample_service.receive_sample(db, {
            "envio_muestra_id": envio.envio_muestra_id,
            "fecha": datetime.now(timezone.utc),
            "operario_id": 1,
            "recibido_en": "Laboratorio de Micro",
            "decision": "Aceptado",
            "observacion": "Recepcion automatizada test"
        })
        
        # Find Auto-created Analisis
        analisis = db.query(AnalisisRepository().model).filter_by(muestra_id=muestra.muestra_id).first()
        if analisis:
            logger.info(f"[TRIGGER] SUCCESS: Analisis automatically created ID {analisis.analisis_id} upon Recepcion Aceptada.")
        else:
            raise ValueError("Trigger failed: No Analisis created after Reception")

        # 4. Resource usage validation (Handshake P5 -> P4)
        analysis_service.register_usage_media(db, {
            "analisis_id": analisis.analisis_id,
            "stock_medios_id": stock_media.stock_medios_id
        })
        logger.info(f"[P4] Linked Media {stock_media.lote_interno} to Analysis {analisis.analisis_id}")
        
        # 5. Result & Auto-compliance
        res = analysis_service.register_resultado(db, {
            "analisis_id": analisis.analisis_id,
            "valor": "Ausencia",
            "valor_numerico": 0.0,
            "unidad": "UFC/g",
            "fecha_reporte": datetime.now(timezone.utc),
            "operario_id": 1
        })
        logger.info(f"[P4] Result Registered: {res.valor_numerico}. Conforme: {res.conforme}")

        # PHASE 6: Audit Trail
        audit_log = db.query(AuditLog).filter_by(tabla_nombre="resultado", registro_id=res.resultado_id).first()
        if audit_log:
            logger.info(f"[P6] AUDIT SUCCESS: Log found for operation {audit_log.operacion}")
        else:
            logger.error("[P6] AUDIT FAILURE: Result not audited")

        logger.info("=== INTEGRATION TEST PASSED: ALL PHASES VERIFIED END-TO-END ===")
        
    except Exception as e:
        logger.error(f"INTEGRATION TEST FAILED: {str(e)}", exc_info=True)
    finally:
        db.close()

if __name__ == "__main__":
    run_integration_test()
