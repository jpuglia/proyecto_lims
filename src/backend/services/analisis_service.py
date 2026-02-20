# src/backend/services/analisis_service.py

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from src.backend.models.fact.analisis import Analisis
from src.backend.models.fact.historial_estado_analisis import HistorialEstadoAnalisis

from src.backend.repositories.analisis_repository import AnalisisRepository
from src.backend.repositories.estado_analisis_repository import EstadoAnalisisRepository
from src.backend.repositories.usuario_repository import UsuarioRepository

from src.backend.core.constants.estados_analisis import EstadosAnalisis


class AnalisisService:

    def __init__(self):

        self.analisis_repo = AnalisisRepository()
        self.estado_repo = EstadoAnalisisRepository()
        self.usuario_repo = UsuarioRepository()

    # =========================================================
    # HELPERS INTERNOS
    # =========================================================

    def _get_analisis_or_fail(self, db: Session, analisis_id: int) -> Analisis:

        analisis = self.analisis_repo.get_by_id(db, analisis_id)

        if not analisis:
            raise ValueError(f"Análisis {analisis_id} no existe")

        return analisis

    def _get_estado(self, db: Session, nombre: str):

        estados = self.estado_repo.get_by_filters(db, nombre=nombre)

        if not estados:
            raise ValueError(f"Estado {nombre} no configurado en base")

        return estados[0]

    def _validar_usuario_activo(self, db: Session, usuario_id: int):

        usuario = self.usuario_repo.get_by_id(db, usuario_id)

        if not usuario:
            raise ValueError("Usuario no existe")

        if not usuario.activo:
            raise ValueError("Usuario inactivo")

    def _validar_estado(self, analisis: Analisis, permitidos: list[str]):

        estado_actual = analisis.estado.nombre

        if estado_actual not in permitidos:
            raise ValueError(
                f"Transición inválida desde {estado_actual}. Permitidos: {permitidos}"
            )

    def _registrar_historial(
        self,
        db: Session,
        analisis_id: int,
        estado_id: int,
        usuario_id: int
    ):

        historial = HistorialEstadoAnalisis(
            analisis_id=analisis_id,
            estado_id=estado_id,
            fecha=datetime.now(timezone.utc),
            usuario_id=usuario_id
        )

        db.add(historial)
        db.flush()

    def _cambiar_estado(
        self,
        db: Session,
        analisis: Analisis,
        nuevo_estado_nombre: str,
        usuario_id: int,
        campos_extra: dict | None = None
    ) -> Analisis:

        nuevo_estado = self._get_estado(db, nuevo_estado_nombre)

        data = {
            "estado_id": nuevo_estado.id,
            "ultimo_cambio": datetime.now(timezone.utc)
        }

        if campos_extra:
            data.update(campos_extra)

        analisis = self.analisis_repo.update(
            db=db,
            obj=analisis,
            data=data,
            usuario_id=usuario_id
        )

        self._registrar_historial(
            db=db,
            analisis_id=analisis.id,
            estado_id=nuevo_estado.id,
            usuario_id=usuario_id
        )

        return analisis

    # =========================================================
    # CREACIÓN
    # =========================================================

    def crear(
        self,
        db: Session,
        recepcion_id: int,
        metodo_version_id: int,
        usuario_id: int
    ) -> Analisis:

        self._validar_usuario_activo(db, usuario_id)

        estado_inicial = self._get_estado(db, EstadosAnalisis.PENDIENTE)

        data = {
            "recepcion_id": recepcion_id,
            "metodo_version_id": metodo_version_id,
            "estado_id": estado_inicial.id,
            "usuario_id": usuario_id,
            "fecha_inicio": None,
            "ultimo_cambio": datetime.now(timezone.utc)
        }

        analisis = self.analisis_repo.create(
            db=db,
            data=data,
            usuario_id=usuario_id
        )

        self._registrar_historial(
            db=db,
            analisis_id=analisis.id,
            estado_id=estado_inicial.id,
            usuario_id=usuario_id
        )

        return analisis

    # =========================================================
    # PROGRAMAR
    # =========================================================

    def programar(
        self,
        db: Session,
        analisis_id: int,
        fecha_programada,
        usuario_id: int
    ) -> Analisis:

        analisis = self._get_analisis_or_fail(db, analisis_id)

        self._validar_estado(
            analisis,
            [EstadosAnalisis.PENDIENTE]
        )

        if fecha_programada <= datetime.now(timezone.utc):
            raise ValueError("La fecha debe ser futura")

        return self._cambiar_estado(
            db=db,
            analisis=analisis,
            nuevo_estado_nombre=EstadosAnalisis.PROGRAMADO,
            usuario_id=usuario_id,
            campos_extra={"fecha_programada": fecha_programada}
        )

    # =========================================================
    # ASIGNAR ANALISTA
    # =========================================================

    def asignar_analista(
        self,
        db: Session,
        analisis_id: int,
        analista_id: int,
        usuario_id: int
    ) -> Analisis:

        analisis = self._get_analisis_or_fail(db, analisis_id)

        self._validar_usuario_activo(db, analista_id)

        self._validar_estado(
            analisis,
            [
                EstadosAnalisis.PENDIENTE,
                EstadosAnalisis.PROGRAMADO
            ]
        )

        return self.analisis_repo.update(
            db=db,
            obj=analisis,
            data={"usuario_id": analista_id},
            usuario_id=usuario_id
        )

    # =========================================================
    # INICIAR
    # =========================================================

    def iniciar(
        self,
        db: Session,
        analisis_id: int,
        usuario_id: int
    ) -> Analisis:

        analisis = self._get_analisis_or_fail(db, analisis_id)

        self._validar_estado(
            analisis,
            [
                EstadosAnalisis.PENDIENTE,
                EstadosAnalisis.PROGRAMADO
            ]
        )

        if not analisis.usuario_id:
            raise ValueError("Debe tener analista asignado")

        return self._cambiar_estado(
            db=db,
            analisis=analisis,
            nuevo_estado_nombre=EstadosAnalisis.EN_PROCESO,
            usuario_id=usuario_id,
            campos_extra={
                "fecha_inicio": datetime.now(timezone.utc)
            }
        )

    # =========================================================
    # FINALIZAR
    # =========================================================

    def finalizar(
        self,
        db: Session,
        analisis_id: int,
        usuario_id: int
    ) -> Analisis:

        analisis = self._get_analisis_or_fail(db, analisis_id)

        self._validar_estado(
            analisis,
            [EstadosAnalisis.EN_PROCESO]
        )

        return self._cambiar_estado(
            db=db,
            analisis=analisis,
            nuevo_estado_nombre=EstadosAnalisis.FINALIZADO,
            usuario_id=usuario_id
        )

    # =========================================================
    # CANCELAR
    # =========================================================

    def cancelar(
        self,
        db: Session,
        analisis_id: int,
        usuario_id: int
    ) -> Analisis:

        analisis = self._get_analisis_or_fail(db, analisis_id)

        self._validar_estado(
            analisis,
            [
                EstadosAnalisis.PENDIENTE,
                EstadosAnalisis.PROGRAMADO
            ]
        )

        return self._cambiar_estado(
            db=db,
            analisis=analisis,
            nuevo_estado_nombre=EstadosAnalisis.CANCELADO,
            usuario_id=usuario_id
        )
