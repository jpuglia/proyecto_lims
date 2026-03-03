import logging
import os
import sys
from datetime import datetime, timezone
import json

# Add project root to sys.path
sys.path.append(os.getcwd())

from src.backend.database.db_manager import db_manager
from src.backend.repositories.fact import (
    SolicitudMuestreoRepository, MuestreoRepository, MuestraRepository,
    EnvioMuestraRepository, RecepcionRepository, AnalisisRepository,
    ResultadoRepository, HistoricoSolicitudMuestreoRepository,
    IncubacionRepository, EstadoAnalisisRepository, HistorialEstadoAnalisisRepository
)
from src.backend.repositories.master import EspecificacionRepository
from src.backend.repositories.inventory import UsoMediosRepository, UsoCepaRepository
from src.backend.services.sample_service import SampleService
from src.backend.services.analysis_service import AnalysisService

# Setup logging
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/verification.log", mode='w'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("WorkflowVerification")

def verify_workflow():
    db = db_manager.SessionLocal()
    logger.info("--- STARTING COMPLETE 10-STEP WORKFLOW VERIFICATION ---")
    
    try:
        # Repositories & Services
        sol_repo = SolicitudMuestreoRepository()
        hist_sol_repo = HistoricoSolicitudMuestreoRepository()
        muestreo_repo = MuestreoRepository()
        muestra_repo = MuestraRepository()
        envio_repo = EnvioMuestraRepository()
        recepcion_repo = RecepcionRepository()
        analisis_repo = AnalisisRepository()
        estado_ana_repo = EstadoAnalisisRepository()
        hist_ana_repo = HistorialEstadoAnalisisRepository()
        resultado_repo = ResultadoRepository()
        uso_medios_repo = UsoMediosRepository()
        uso_cepa_repo = UsoCepaRepository()
        
        sample_service = SampleService(
            solicitud_repo=sol_repo,
            historico_solicitud_repo=hist_sol_repo,
            muestreo_repo=muestreo_repo,
            muestra_repo=muestra_repo,
            envio_repo=envio_repo,
            recepcion_repo=recepcion_repo
        )
        
        analysis_service = AnalysisService(
            analisis_repo=analisis_repo,
            estado_analisis_repo=estado_ana_repo,
            historial_repo=hist_ana_repo,
            incubacion_repo=IncubacionRepository(),
            resultado_repo=resultado_repo,
            especificacion_repo=EspecificacionRepository(),
            uso_medios_repo=uso_medios_repo,
            uso_cepa_repo=uso_cepa_repo
        )

        # --- STEP 1: Solicitud ---
        logger.info("[STEP 1] Action: Creating Sampling Request")
        solicitud = sample_service.create_sampling_request(db, {
            "usuario_id": 1,
            "tipo": "Ambiental",
            "estado_solicitud_id": 1,
            "observacion": "Workflow Verification"
        }, usuario_id=1)
        logger.info(f"LOG: Solicitud ID {solicitud.solicitud_muestreo_id} created. Status: {solicitud.estado_solicitud_id}")

        # --- STEP 2: Muestreo (Session) ---
        logger.info("[STEP 2] Action: Registering Sampling Execution")
        muestreo = sample_service.register_sampling_session(db, {
            "solicitud_muestreo_id": solicitud.solicitud_muestreo_id,
            "operario_id": 1,
            "fecha_inicio": datetime.now(timezone.utc)
        }, [{"tipo_muestra": "Ambiental", "codigo_etiqueta": f"TAG-{solicitud.solicitud_muestreo_id}", "observacion": "Test sample"}])
        db.refresh(solicitud)
        logger.info(f"LOG: Session {muestreo.muestreo_id} registered. Automated status transition: {solicitud.estado_solicitud_id}")

        # --- STEP 3: Envío ---
        logger.info("[STEP 3] Action: Sending Sample to Lab")
        muestra = muestreo.muestras[0]
        envio = envio_repo.create(db, {
            "muestra_id": muestra.muestra_id,
            "fecha": datetime.now(timezone.utc),
            "operario_id": 1,
            "destino": "Lab Microbiología"
        })
        logger.info(f"LOG: Envio ID {envio.envio_muestra_id} created for Muestra {muestra.muestra_id}")

        # --- STEP 4: Recepción ---
        logger.info("[STEP 4] Action: Receiving Sample at Lab")
        recepcion = sample_service.receive_sample(db, {
            "envio_muestra_id": envio.envio_muestra_id,
            "operario_id": 1,
            "recibido_en": "Microbiología",
            "decision": "Aceptado",
            "fecha": datetime.now(timezone.utc)
        })
        logger.info(f"LOG: Recepcion ID {recepcion.recepcion_id} created.")

        # --- STEP 5: Entrada Análisis ---
        logger.info("[STEP 5] Action: Creating Analysis Entrance")
        analisis = analysis_service.create_analisis(db, {
            "muestra_id": muestra.muestra_id,
            "recepcion_id": recepcion.recepcion_id,
            "metodo_version_id": 1,
            "estado_analisis_id": 1, # Programado
            "operario_id": 1,
            "fecha_inicio": datetime.now(timezone.utc)
        }, operario_id=1)
        logger.info(f"LOG: Analisis ID {analisis.analisis_id} registered.")

        # --- STEP 6: Ejecución Análisis ---
        logger.info("[STEP 6] Action: Analysis Execution (Updating state)")
        # Simulating state change to 'En Proceso' (2)
        analisis_repo.update(db, analisis, {"estado_analisis_id": 2})
        logger.info(f"LOG: Analysis ID {analisis.analisis_id} status updated to 2 (En Proceso).")

        # --- STEP 7: Medios de Cultivo ---
        logger.info("[STEP 7] Action: Registering Media Usage")
        analysis_service.register_usage_media(db, {"analisis_id": analisis.analisis_id, "stock_medios_id": 1})
        logger.info("LOG: Culture media linked to analysis.")

        # --- STEP 8: Cepas/Equipos ---
        logger.info("[STEP 8] Action: Registering Strain Usage")
        analysis_service.register_usage_strain(db, {"analisis_id": analisis.analisis_id, "cepa_referencia_id": 1})
        logger.info("LOG: Reference strains linked to analysis.")

        # --- STEP 9: Resultados ---
        logger.info("[STEP 9] Action: Reporting Final Results")
        resultado = analysis_service.register_resultado(db, {
            "analisis_id": analisis.analisis_id,
            "operario_id": 1,
            "valor": "CUMPLE",
            "valor_numerico": 0.0,
            "unidad": "UFC/g",
            "fecha_reporte": datetime.now(timezone.utc)
        })
        logger.info(f"LOG: Result ID {resultado.resultado_id} reported. Conforme: {resultado.conforme}")

        # --- STEP 10: Informe Final ---
        logger.info("[STEP 10] Action: Generating Consolidated Report")
        report = analysis_service.get_analysis_report(db, solicitud.solicitud_muestreo_id)
        
        logger.info("FINAL VERIFICATION CHECK:")
        logger.info(f"- Solicitud: {report['solicitud'].solicitud_muestreo_id} OK")
        logger.info(f"- Muestras: {len(report['muestras'])} OK")
        logger.info(f"- Analisis: {len(report['analisis'])} OK")
        logger.info(f"- Resultados: {len(report['resultados'])} OK")
        
        logger.info("--- WORKFLOW VERIFICATION SUCCESSFUL ---")

    except Exception as e:
        logger.error(f"WORKFLOW VERIFICATION FAILED: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    verify_workflow()
