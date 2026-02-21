from src.backend.repositories.incubacion_repository import IncubacionRepository
from src.backend.repositories.analisis_repository import AnalisisRepository
from src.backend.repositories.usuario_repository import UsuarioRepository
from src.backend.models.fact.incubacion import Incubacion

from sqlalchemy.orm import Session

from datetime import datetime, timezone, timezone

from typing import cast

class IncubacionService():

    def __init__(self) -> None:
        
        self.incubacion_repo = IncubacionRepository()
        self.analisis_repo = AnalisisRepository()
        self.usuario_repo = UsuarioRepository()

    def incubar(self, db: Session, analisis_id: int, data: dict) -> Incubacion:

        '''
        Docstring for incubar
        
        :param self: Description
        :param db: Description
        :type db: Session
        :param analisis_id: analisis_id a incubar
        :type analisis_id: int
        :return: Objeto clase Incubacion
        :rtype: Incubacion
        '''

        campos_requeridos = ['analisis_id', 'equipo_id', 'entrada', 'usuario_entrada_id']

        for campo in campos_requeridos:
            if campo not in data:
                raise ValueError(
                    f"Campo obligatorio faltante: {campo}"
                )
            
        analisis = self.analisis_repo.get_by_id(
            db = db,
            obj_id = analisis_id
        )

        if not analisis:
            raise ValueError(
                f'No se encuentra analisis {analisis_id} en tabla Analisis'
            )
        
        analisis = self.analisis_repo.update(
            db = db,
            obj = analisis,
            data = {"estado": "INCUBANDO",
                    "ultimo_cambio": datetime.now(timezone.utc)}
        )

        incubacion = self.incubacion_repo.create(db, data)

        return incubacion
    
    def fin_incubacion(self, db: Session, incubacion_id: int, user_id: int) -> Incubacion:
        '''
        Docstring for fin_incubacion
        
        :param self: Description
        :param db: Description
        :type db: Session
        :param incubacion_id: Description
        :type incubacion_id: int
        :return: Description
        :rtype: Incubacion
        '''

        incubacion = self.incubacion_repo.get_by_id(
            db = db,
            obj_id = incubacion_id
        )

        if not incubacion:
            raise ValueError(
                f'Valor inválido para incubacion_id'
            )
        
        incubacion = self.incubacion_repo.update(
            db = db,
            obj = incubacion,
            data = {"salida": datetime.now(timezone.utc)}
        )

        analisis_id = cast(int,incubacion.analisis_id)

        analisis = self.analisis_repo.get_by_id(db, analisis_id)

        if analisis and analisis.estado == 'INCUBANDO':
            analisis = self.analisis_repo.update(
                db = db,
                obj = analisis,
                data = {"estado": "ESPERA LECTURA",
                        "ultimo_cambio": datetime.now(timezone.utc),
                        "usuario_salida_id": user_id}
            )

        return incubacion





            
        

