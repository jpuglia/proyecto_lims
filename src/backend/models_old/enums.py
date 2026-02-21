import enum

class Estado(enum.Enum):
    '''Enum:
            Estados posibles:
            - Revisado
            - En Proceso
            - Rechazado
                '''

    revisado = 'revisado'
    en_proceso = 'en proceso'
    rechazado = 'rechazado'

class Almacenamiento(enum.Enum):
    '''Enum:
        Ambientes posibles:
        - Ambiente
        - Ambiente desecado
        - Freezer
        - Condiciones Especiales
            '''

    ambiente= 'ambiente'
    ambiente_desecado = 'ambiente desecado'
    heladera = 'heladera'
    freezer = 'freezer'
    condiciones_especiales = 'condiciones especiales'

class TipoAnalisis(enum.Enum):
    '''Enum:
        Tipos de analisis:
        - Recuento
        - Búsqueda
            '''

    recuento = 'recuento'
    busqueda = 'búsqueda'