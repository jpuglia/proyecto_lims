from sqlalchemy.orm import Session
from src.backend.repositories.base import BaseRepository
from src.backend.models.fact import (EstadoManufactura, OrdenManufactura, Manufactura, 
                                      ManufacturaOperario, HistoricoEstadoManufactura, 
                                      EstadoSolicitud, SolicitudMuestreo, HistoricoSolicitudMuestreo, 
                                      Muestreo, Muestra, EnvioMuestra, Recepcion, EstadoAnalisis, 
                                      Analisis, HistorialEstadoAnalisis, Incubacion, Resultado)

class EstadoManufacturaRepository(BaseRepository[EstadoManufactura]):
    def __init__(self):
        super().__init__(EstadoManufactura)

class OrdenManufacturaRepository(BaseRepository[OrdenManufactura]):
    def __init__(self):
        super().__init__(OrdenManufactura)

class ManufacturaRepository(BaseRepository[Manufactura]):
    def __init__(self):
        super().__init__(Manufactura)

class ManufacturaOperarioRepository(BaseRepository[ManufacturaOperario]):
    def __init__(self):
        super().__init__(ManufacturaOperario)

class HistoricoEstadoManufacturaRepository(BaseRepository[HistoricoEstadoManufactura]):
    def __init__(self):
        super().__init__(HistoricoEstadoManufactura)

class EstadoSolicitudRepository(BaseRepository[EstadoSolicitud]):
    def __init__(self):
        super().__init__(EstadoSolicitud)

class SolicitudMuestreoRepository(BaseRepository[SolicitudMuestreo]):
    def __init__(self):
        super().__init__(SolicitudMuestreo)

class HistoricoSolicitudMuestreoRepository(BaseRepository[HistoricoSolicitudMuestreo]):
    def __init__(self):
        super().__init__(HistoricoSolicitudMuestreo)

class MuestreoRepository(BaseRepository[Muestreo]):
    def __init__(self):
        super().__init__(Muestreo)

class MuestraRepository(BaseRepository[Muestra]):
    def __init__(self):
        super().__init__(Muestra)

class EnvioMuestraRepository(BaseRepository[EnvioMuestra]):
    def __init__(self):
        super().__init__(EnvioMuestra)

class RecepcionRepository(BaseRepository[Recepcion]):
    def __init__(self):
        super().__init__(Recepcion)

class EstadoAnalisisRepository(BaseRepository[EstadoAnalisis]):
    def __init__(self):
        super().__init__(EstadoAnalisis)

class AnalisisRepository(BaseRepository[Analisis]):
    def __init__(self):
        super().__init__(Analisis)

class HistorialEstadoAnalisisRepository(BaseRepository[HistorialEstadoAnalisis]):
    def __init__(self):
        super().__init__(HistorialEstadoAnalisis)

class IncubacionRepository(BaseRepository[Incubacion]):
    def __init__(self):
        super().__init__(Incubacion)

class ResultadoRepository(BaseRepository[Resultado]):
    def __init__(self):
        super().__init__(Resultado)
