from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from src.backend.repositories.fact import (AnalisisRepository, EstadoAnalisisRepository, 
                                           HistorialEstadoAnalisisRepository, IncubacionRepository, 
                                           ResultadoRepository)
from src.backend.repositories.master import EspecificacionRepository
from src.backend.models.fact import Analisis, Incubacion, Resultado

class AnalysisService:
    def __init__(self,
                 analisis_repo: AnalisisRepository,
                 estado_analisis_repo: EstadoAnalisisRepository,
                 historial_repo: HistorialEstadoAnalisisRepository,
                 incubacion_repo: IncubacionRepository,
                 resultado_repo: ResultadoRepository,
                 especificacion_repo: EspecificacionRepository):
        self.analisis_repo = analisis_repo
        self.estado_analisis_repo = estado_analisis_repo
        self.historial_repo = historial_repo
        self.incubacion_repo = incubacion_repo
        self.resultado_repo = resultado_repo
        self.especificacion_repo = especificacion_repo

    def create_analisis(self, db: Session, analisis_data: dict, operario_id: int) -> Analisis:
        analisis = self.analisis_repo.create(db, analisis_data)
        
        self.historial_repo.create(db, {
            "analisis_id": analisis.analisis_id,
            "estado_analisis_id": analisis_data["estado_analisis_id"],
            "fecha": datetime.now(timezone.utc),
            "operario_id": operario_id
        })
        return analisis

    def start_incubation(self, db: Session, incubacion_data: dict) -> Incubacion:
        return self.incubacion_repo.create(db, incubacion_data)

    def register_resultado(self, db: Session, resultado_data: dict) -> Resultado:
        # Evaluate specification if provided numerically
        analisis = self.analisis_repo.get(db, resultado_data["analisis_id"])
        
        conforme = None
        if analisis and analisis.especificacion_id and "valor_numerico" in resultado_data:
            especificacion = self.especificacion_repo.get(db, analisis.especificacion_id)
            if especificacion:
                val = resultado_data["valor_numerico"]
                if especificacion.valor_min is not None and val < especificacion.valor_min:
                    conforme = False
                elif especificacion.valor_max is not None and val > especificacion.valor_max:
                    conforme = False
                else:
                    conforme = True
                    
        resultado_data["conforme"] = conforme
        
        return self.resultado_repo.create(db, resultado_data)
