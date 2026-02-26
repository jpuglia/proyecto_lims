# Sistema LIMS – URUFARMA

Sistema de Gestión de Información de Laboratorio (LIMS) para la digitalización de procesos operativos, trazabilidad y análisis de datos en URUFARMA S.A.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Python 3.10+ / FastAPI |
| ORM | SQLAlchemy 2.0 |
| Base de datos (dev) | SQLite |
| Base de datos (prod) | PostgreSQL |
| Migraciones | Alembic |
| Frontend | React *(pendiente)* |

## Estructura del Proyecto

```
proyecto_lims/
├── main.py                     # Punto de entrada
├── requirements.txt            # Dependencias del proyecto
├── documentacion/              # PRD, MER, requisitos técnicos
├── itinerario/                 # Estado y seguimiento del repositorio
└── src/
    ├── config/pipeline.json    # Configuración del pipeline de carga de datos
    └── backend/
        ├── core/               # Decoradores y utilidades
        ├── database/           # DataBaseManager (SQLAlchemy engine + session)
        ├── data_loaders/       # Pipeline de carga de datos desde CSV
        ├── models/             # 48 modelos SQLAlchemy (auth, dim, fact, inventory, master)
        ├── repositories/       # Patrón Repository (CRUD genérico + repositorios específicos)
        └── services/           # Lógica de negocio (auth, equipment, manufacturing, sample, analysis, inventory)
```

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd proyecto_lims

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt
```

## Uso

```bash
# Iniciar el servidor de la API
python main.py
```

## Migraciones (Alembic)

El sistema utiliza Alembic para la gestión de la base de datos.
```bash
# Aplicar últimas migraciones
python -m alembic upgrade head

# Generar nueva migración (tras cambios en modelos)
python -m alembic revision --autogenerate -m "descripción"
```

## Pruebas (Pytest)

Se incluye una suite de pruebas que cubre modelos, repositorios, servicios y API.
```bash
# Ejecutar todas las pruebas
python -m pytest tests/ -v
```

## Módulos Principales

- **Auth:** Usuarios, roles, audit trail, operarios
- **Dimensiones:** Sistemas, plantas, áreas, equipos, puntos de muestreo
- **Datos Maestros:** Productos, especificaciones, métodos, cepas de referencia
- **Transacciones:** Manufactura, muestreo, análisis, resultados
- **Inventario:** Polvos/suplementos, medios de cultivo, stock, aprobaciones

## Documentación

- [PRD](documentacion/prd.md) – Requisitos del producto
- [Requisitos Técnicos](documentacion/requisitos_tecnicos.md) – Stack y estándares
- [Itinerario de Producción](documentacion/itinerario_produccion.md) – Cronograma

## Estado del Desarrollo

Consultar [itinerario/](itinerario/) para el estado actualizado del repositorio.

## Licencia

Ver [LICENSE](LICENSE).
