import pytest
from datetime import datetime, timezone

def test_complete_sampling_analysis_workflow(auth_client, seed_data, db_session):
    # 1. Step 1: Create Sampling Request
    solicitud_resp = auth_client.post(
        "/api/muestreo/solicitudes",
        json={
            "usuario_id": 1,
            "tipo": "Ambiental",
            "estado_solicitud_id": 1, # Pendiente
            "observacion": "Prueba de workflow e2e"
        }
    )
    assert solicitud_resp.status_code == 201
    sol_id = solicitud_resp.json()["solicitud_muestreo_id"]

    # 2. Step 2: Register Sampling Session
    # Create an operario first
    op_resp = auth_client.post(
        "/api/auth/operarios",
        json={"nombre": "Op", "apellido": "Test", "codigo_empleado": "T-001"}
    )
    operario_id = op_resp.json()["operario_id"]

    session_payload = {
        "session": {
            "solicitud_muestreo_id": sol_id,
            "operario_id": operario_id,
            "fecha_inicio": datetime.now(timezone.utc).isoformat()
        },
        "muestras": [
            {
                "tipo_muestra": "Ambiental",
                "codigo_etiqueta": f"TAG-{sol_id}",
                "punto_muestreo_id": 1 # Seeded in seed_data if we add it, but for now repo might not strictly enforce FK
            }
        ]
    }
    session_resp = auth_client.post("/api/muestreo/sesiones", json=session_payload)
    assert session_resp.status_code == 201
    muestreo_id = session_resp.json()["muestreo_id"]
    
    # Get the sample from DB
    from src.backend.models.fact import Muestra
    muestra = db_session.query(Muestra).filter_by(muestreo_id=muestreo_id).first()
    assert muestra is not None
    muestra_id = muestra.muestra_id

    # 3. Step 3: Verify Automated transition
    get_sol = auth_client.get(f"/api/muestreo/solicitudes")
    sol = next(s for s in get_sol.json() if s["solicitud_muestreo_id"] == sol_id)
    assert sol["estado_solicitud_id"] == 3 # Completado

    # 3.5 Step 3.5: Create Envio
    envio_resp = auth_client.post(
        "/api/muestreo/envios",
        json={
            "muestra_id": muestra_id,
            "fecha": datetime.now(timezone.utc).isoformat(),
            "operario_id": operario_id,
            "destino": "Laboratorio Central"
        }
    )
    assert envio_resp.status_code == 201
    envio_id = envio_resp.json()["envio_muestra_id"]

    # 4. Step 4: Create Reception (required for Analysis)
    reception_resp = auth_client.post(
        "/api/muestreo/recepciones",
        json={
            "envio_muestra_id": envio_id,
            "operario_id": operario_id,
            "recibido_en": "Laboratorio Central",
            "decision": "Aceptado",
            "observacion": "Recepcion E2E"
        }
    )
    assert reception_resp.status_code == 201
    recepcion_id = reception_resp.json()["recepcion_id"]

    # 5. Step 5: Create Analysis Entry
    # Seed a Method first
    from src.backend.models.master import MetodoVersion
    db_session.add(MetodoVersion(metodo_version_id=1, codigo="MET-001", nombre="Metodo Test", version=1))
    db_session.commit()

    analysis_resp = auth_client.post(
        "/api/analisis/",
        json={
            "muestra_id": muestra_id,
            "recepcion_id": recepcion_id,
            "metodo_version_id": 1,
            "estado_analisis_id": 1, # Pendiente
            "operario_id": operario_id
        }
    )
    assert analysis_resp.status_code == 201
    analisis_id = analysis_resp.json()["analisis_id"]

    # 6. Step 9: Register Result
    result_resp = auth_client.post(
        "/api/analisis/resultados",
        json={
            "analisis_id": analisis_id,
            "operario_id": operario_id,
            "parametro": "Recuento",
            "valor": "10",
            "unidad": "UFC",
            "cumple": True,
            "observacion": "Resultado E2E"
        }
    )
    assert result_resp.status_code == 201

    # 7. Step 10: Consolidated Report
    report_resp = auth_client.get(f"/api/analisis/report/{sol_id}")
    assert report_resp.status_code == 200
    report = report_resp.json()
    assert report["solicitud"]["solicitud_muestreo_id"] == sol_id
    assert len(report["muestras"]) == 1
    assert report["resultados"][0]["valor"] == "10"
