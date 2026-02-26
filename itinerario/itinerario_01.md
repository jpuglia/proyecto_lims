# Itinerario 01 – Estado Actual del Repositorio

**Fecha:** 2026-02-26  
**Autor:** Asistente AI  
**Repositorio:** `proyecto_lims`

---

## 1. Resumen General

El repositorio `proyecto_lims` implementa un **Sistema de Gestión de Información de Laboratorio (LIMS)** para URUFARMA S.A. El proyecto se encuentra en una **etapa temprana de desarrollo** del backend, con el modelo de datos consolidado, el patrón repositorio implementado, una capa de servicios definida y un pipeline de carga de datos iniciales. Aún **no existe frontend**, API REST (FastAPI), ni migraciones (Alembic).

---

## 2. Estructura del Repositorio

```
proyecto_lims/
├── .git/
├── .gitattributes
├── .gitignore
├── LICENSE
├── README.md                              # Vacío (solo título)
├── lab_dev.db                             # Base de datos SQLite de desarrollo
├── main.py                                # Punto de entrada: inicializa la DB
├── documentacion/
│   ├── MER.mmd                            # Modelo Entidad-Relación (Mermaid)
│   ├── prd.md                             # Product Requirements Document
│   ├── requisitos_tecnicos.md             # Requisitos técnicos
│   ├── presentacion_idea.md               # Presentación de la idea
│   ├── onboarding_architecture.md         # Arquitectura de onboarding
│   ├── itinerario_produccion.md           # Plan de producción (cronograma)
│   └── software_architecture_diagram.mmd  # Diagrama de arquitectura (Mermaid)
├── itinerario/                            # ← NUEVA CARPETA (contexto para IA)
│   └── itinerario_01.md                   # Este archivo
└── src/
    ├── config/
    │   └── pipeline.json                  # Configuración del pipeline de carga
    ├── test_imports.py                    # Script de verificación de imports
    └── backend/
        ├── core/
        │   └── decorators/                # Decoradores reutilizables
        ├── database/
        │   └── db_manager.py              # DataBaseManager (SQLAlchemy + SQLite)
        ├── data_loaders/
        │   ├── decorators.py
        │   ├── generic_loader.py
        │   ├── load_all.py
        │   ├── pipeline_runner.py
        │   ├── resolvers.py
        │   └── runner.py
        ├── models/                        # Modelos SQLAlchemy (ACTIVOS)
        │   ├── __init__.py
        │   ├── base.py
        │   ├── auth.py
        │   ├── dim.py
        │   ├── fact.py
        │   ├── inventory.py
        │   └── master.py
        ├── models_old/                    # Modelos anteriores (deprecados)
        ├── repositories/                  # Repositorios (ACTIVOS)
        │   ├── __init__.py
        │   ├── base.py
        │   ├── auth.py
        │   ├── dim.py
        │   ├── fact.py
        │   ├── inventory.py
        │   └── master.py
        ├── repositories_old/              # Repositorios anteriores (deprecados)
        ├── services/                      # Servicios (ACTIVOS)
        │   ├── __init__.py
        │   ├── auth_service.py
        │   ├── equipment_service.py
        │   ├── manufacturing_service.py
        │   ├── sample_service.py
        │   ├── analysis_service.py
        │   └── inventory_service.py
        └── services_old/                  # Servicios anteriores (deprecados)
```

---

## 3. Modelos de Datos (48 modelos SQLAlchemy)

### 3.1 Autenticación y Auditoría (`models/auth.py`)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `Usuario` | `usuario` | Usuarios del sistema |
| `Rol` | `rol` | Roles de seguridad |
| `UsuarioRol` | `usuario_rol` | Asignación usuario-rol (N:N) |
| `AuditTrail` | `audit_trail` | Registro de auditoría |
| `Revision` | `revision` | Revisiones de registros |
| `Operario` | `operario` | Operarios vinculados a usuarios |

### 3.2 Dimensiones (`models/dim.py`)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `Sistema` | `sistema` | Sistemas organizacionales |
| `Planta` | `planta` | Plantas físicas |
| `Area` | `area` | Áreas dentro de plantas |
| `TipoEquipo` | `tipo_equipo` | Tipos de equipo |
| `EstadoEquipo` | `estado_equipo` | Estados de equipos |
| `EquipoInstrumento` | `equipo_instrumento` | Equipos e instrumentos |
| `ZonaEquipo` | `zona_equipo` | Zonas dentro de equipos |
| `CalibracionCalificacionEquipo` | `calibracion_calificacion_equipo` | Calibraciones/calificaciones |
| `HistoricoEstadoEquipo` | `historico_estado_equipo` | Historial de estados de equipos |
| `PuntoMuestreo` | `punto_muestreo` | Puntos de muestreo |

### 3.3 Datos Maestros (`models/master.py`)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `Producto` | `producto` | Productos fabricados |
| `Especificacion` | `especificacion` | Especificaciones de producto |
| `MetodoVersion` | `metodo_version` | Métodos de análisis versionados |
| `CepaReferencia` | `cepa_referencia` | Cepas de referencia (microbiología) |

### 3.4 Transacciones / Hechos (`models/fact.py`)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `EstadoManufactura` | `estado_manufactura` | Estados de manufactura |
| `OrdenManufactura` | `orden_manufactura` | Órdenes de manufactura |
| `Manufactura` | `manufactura` | Procesos de manufactura |
| `ManufacturaOperario` | `manufactura_operario` | Operarios en manufactura |
| `HistoricoEstadoManufactura` | `historico_estado_manufactura` | Historial de estado |
| `EstadoSolicitud` | `estado_solicitud` | Estados de solicitud |
| `SolicitudMuestreo` | `solicitud_muestreo` | Solicitudes de muestreo |
| `HistoricoSolicitudMuestreo` | `historico_solicitud_muestreo` | Historial de solicitudes |
| `Muestreo` | `muestreo` | Eventos de muestreo |
| `Muestra` | `muestra` | Muestras individuales |
| `EnvioMuestra` | `envio_muestra` | Envíos de muestras |
| `Recepcion` | `recepcion` | Recepción de muestras |
| `EstadoAnalisis` | `estado_analisis` | Estados de análisis |
| `Analisis` | `analisis` | Análisis de laboratorio |
| `HistorialEstadoAnalisis` | `historial_estado_analisis` | Historial de estados |
| `Incubacion` | `incubacion` | Incubaciones |
| `Resultado` | `resultado` | Resultados de análisis |

### 3.5 Inventario (`models/inventory.py`)

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `PolvoSuplemento` | `polvo_suplemento` | Polvos y suplementos |
| `RecepcionPolvoSuplemento` | `recepcion_polvo_suplemento` | Recepción de polvos |
| `StockPolvoSuplemento` | `stock_polvo_suplemento` | Stock de polvos |
| `UsoPolvoSuplemento` | `uso_polvo_suplemento` | Uso de polvos |
| `MedioPreparado` | `medio_preparado` | Medios de cultivo |
| `OrdenPreparacionMedio` | `orden_preparacion_medio` | Órdenes de preparación |
| `EstadoQC` | `estado_qc` | Estados de control de calidad |
| `StockMedios` | `stock_medios` | Stock de medios |
| `AprobacionMedios` | `aprobacion_medios` | Aprobaciones de medios |
| `UsoMedios` | `uso_medios` | Uso de medios en análisis |
| `UsoCepa` | `uso_cepa` | Uso de cepas en análisis |

---

## 4. Capa de Servicios

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| `AuthService` | `auth_service.py` | Autenticación y gestión de usuarios |
| `EquipmentService` | `equipment_service.py` | Gestión de equipos e instrumentos |
| `ManufacturingService` | `manufacturing_service.py` | Órdenes y procesos de manufactura |
| `SampleService` | `sample_service.py` | Solicitudes de muestreo y muestras |
| `AnalysisService` | `analysis_service.py` | Análisis de laboratorio y resultados |
| `InventoryService` | `inventory_service.py` | Inventario de medios y reactivos |

---

## 5. Infraestructura Técnica

| Componente | Estado | Detalle |
|------------|--------|---------|
| **Base de datos** | ✅ Implementado | SQLite (`lab_dev.db`) via `DataBaseManager` |
| **ORM** | ✅ Implementado | SQLAlchemy con 48 modelos |
| **Repositorios** | ✅ Implementado | Patrón Repository con base genérica |
| **Servicios** | ✅ Implementado | 6 servicios de negocio |
| **Data Loaders** | ✅ Implementado | Pipeline de carga desde CSV (`pipeline.json`) |
| **API REST (FastAPI)** | ❌ No existe | Sin endpoints, sin rutas |
| **Migraciones (Alembic)** | ❌ No existe | Se usa `create_all()` directamente |
| **Frontend (React)** | ❌ No existe | Sin interfaz de usuario |
| **Autenticación** | ❌ No existe | Modelo preparado, sin JWT/OAuth |
| **Tests** | ❌ No existe | Solo `test_imports.py` (verificación básica) |
| **Docker** | ❌ No existe | Sin containerización |
| **CI/CD** | ❌ No existe | Sin pipelines |

---

## 6. Historial de Git (4 commits)

```
ad8be05 refactor: Consolidate backend models, repositories, and services into new, organized modules.
4ad833b Agregado de nuevas relaciones en ruta de recepcion y uso de medios
c62bf3f first commit
7b51521 Initial commit
```

El último commit fue una **refactorización** importante que consolidó modelos, repositorios y servicios en módulos organizados. Los archivos anteriores se conservan en carpetas `*_old` como referencia.

---

## 7. Observaciones y Deuda Técnica

1. **Carpetas `_old`:** Existen `models_old/`, `repositories_old/` y `services_old/` que contienen código deprecado. Deberían eliminarse una vez confirmada la estabilidad de los módulos nuevos.
2. **`README.md` vacío:** Solo contiene el título del proyecto. Necesita documentación del proyecto, instrucciones de setup y uso.
3. **Faltan `relationships` en varios modelos `fact.py` e `inventory.py`:** Algunos modelos de transacciones no tienen `relationship()` definidas (e.g., `ManufacturaOperario`, `HistoricoEstadoManufactura`, `SolicitudMuestreo`, etc.).
4. **Sin gestión de dependencias:** No hay `requirements.txt`, `pyproject.toml` ni `Pipfile` visible en el repositorio.
5. **`main.py` minimalista:** Solo inicializa la DB. No levanta ningún servidor ni ejecuta el pipeline de datos.

---

## 8. Próximos Pasos Planificados

### Fase inmediata (Prioridad Alta)

- [ ] **Limpieza:** Eliminar carpetas `*_old` tras validar que los módulos nuevos están completos.
- [ ] **Gestión de dependencias:** Crear `requirements.txt` o `pyproject.toml` con todas las dependencias del proyecto.
- [ ] **Completar relationships:** Revisar y agregar `relationship()` faltantes en modelos de `fact.py` e `inventory.py`.
- [ ] **README.md:** Documentar objetivo del proyecto, instrucciones de setup y uso básico.

### Fase siguiente (Prioridad Media)

- [ ] **API REST con FastAPI:** Crear estructura de routers, schemas (Pydantic) y endpoints CRUD para cada módulo.
- [ ] **Autenticación:** Implementar JWT + sistema de autenticación y autorización basado en roles.
- [ ] **Alembic:** Configurar migraciones de base de datos para evolución controlada del schema.
- [ ] **Validaciones de negocio:** Reforzar las validaciones en la capa de servicios.

### Fase posterior (Prioridad Normal)

- [ ] **Tests:** Suite de pruebas unitarias y de integración con pytest.
- [ ] **Frontend React:** Scaffolding inicial, autenticación, formularios de carga y dashboards.
- [ ] **Docker:** Containerización del entorno de desarrollo y producción.
- [ ] **CI/CD:** Pipeline de integración y despliegue continuo.

---

> **Nota:** Este archivo forma parte de la carpeta `itinerario/`, que actúa como fuente de contexto para herramientas de IA en futuras solicitudes. Cada nuevo itinerario tendrá numeración incremental (`itinerario_02.md`, etc.).
