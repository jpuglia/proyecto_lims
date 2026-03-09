# Itinerario de Producción - Sistema LIMS URUFARMA

Este documento detalla el plan de acción para el desarrollo e implementación del Sistema de Gestión de Información de Laboratorio (LIMS) en URUFARMA S.A. El objetivo es transitar de un modelo analógico basado en papel a una arquitectura digital centralizada y automatizada.

## 1. Metodología de Trabajo

Se adoptará una metodología **Ágil (Scrum/Kanban)** para permitir entregas incrementales y ajustes continuos basados en el feedback de los usuarios clave.

*   **Sprints:** De 2 a 3 semanas.
*   **Revisiones:** Al finalizar cada sprint con los interesados (stakeholders).
*   **Validaciones:** Pruebas de usuario (UAT) constantes para asegurar la usabilidad.

---

## 2. Fases del Proyecto

### Fase 1: Análisis y Definición de Requerimientos (Mes 1)
*   **Relevamiento Detallado:** Entrevistas con operadores, supervisores y analistas para mapear flujos actuales.
*   **Refinamiento de Especificaciones:** Finalización del PRD y definición de KPIs.
*   **Diseño de Datos:** Consolidación del Modelo Entidad-Relación (MER) basado en el esquema `MER.mmd`.

### Fase 2: Diseño de Arquitectura y UX/UI (Mes 2)
*   **Infraestructura Backend:** Configuración de FastAPI, SQLAlchemy y Alembic.
*   **Diseño de Interfaz:** Creación de mockups en Figma/Adobe XD para interfaces intuitivas (registro de datos, dashboards).
*   **Definición de Seguridad:** Implementación de roles (RBAC) y protocolos de auditoría (Audit Trail).

### Fase 3: Desarrollo del Núcleo (Backend & Database) (Completado - Release Candidate 1)
*   **Módulo 1 (Sistemas y Recursos):** Gestión de Plantas, Áreas y Equipos (✅ OK).
*   **Módulo 2 (Usuarios y Seguridad):** Autenticación, Roles y Trail de Auditoría (✅ OK).
*   **Módulo 3 (Configuración Técnica):** Productos, Especificaciones y Métodos (✅ OK).
*   **Módulo 4 (Operaciones y Manufactura):** Backend completado, integrando con Frontend.

### Fase 4: Desarrollo del Frontend e Integración (Avanzado)
*   **Componentes React:** Dashboard, CRUDs y Formularios base completados.
*   **UX/UI:** Diseño Premium con Glassmorphism y Animaciones Framer Motion (✅ OK).
*   **Módulo de Análisis y Resultados:** Backend 100%, Frontend en integración final.
*   **Módulo de Materiales:** CRUDs de Inventario funcionales.

### Fase 5: Pruebas y Aseguramiento de Calidad (Activo)
*   **Backend Testing:** 48/48 tests pasando con Pytest (✅ OK).
*   **Frontend Testing:** Automatización con Playwright en progreso (Setup OK, tests críticos en desarrollo).
*   **Validaciones:** Verificación de Audit Trail funcional en todas las capas.

### Fase 6: Implementación y Puesta en Marcha (Preparación)
*   **Infraestructura:** `docker-compose.yml` base listo para orquestación.
*   **Base de Datos:** Plan de migración de SQLite a PostgreSQL definido.


---

## 3. Entregables Clave por Módulo

| Módulo | Entregable Principal | Documento de Referencia |
| :--- | :--- | :--- |
| **Recursos** | Panel de gestión de Equipos y Calibraciones | MER (EQUIPO, AREA, PLANTA) |
| **Seguridad** | Registro de Auditoría (Audit Trail) funcional | PRD (Sección 6.5) |
| **Análisis** | Formularios de ingreso de resultados con validación | MER (ANALISIS, RESULTADO) |
| **Materiales** | Inventario de Medios y Reactivos | MER (STOCK_MEDIOS, POLVO) |
| **Reporting** | Dashboards en Power BI / Tabla de Reportes | Requisitos Técnicos (Sección 11) |

---

## 4. Riesgos Críticos y Mitigación

1.  **Resistencia al Cambio:** Mitigar mediante la inclusión de usuarios finales en las etapas de diseño.
2.  **Integridad de Datos en Migración:** Realizar pruebas de carga exhaustivas antes de la puesta en producción.
3.  **Complejidad del Modelo Normativo:** Asegurar que cada campo cumpla con los requisitos de trazabilidad (GAMP 5 / 21 CFR Part 11).

---

## 5. Cronograma Resumido (Gantt Conceptual)

```mermaid
gantt
    title Plan de Implementación LIMS
    dateFormat  YYYY-MM-DD
    section Fase 1
    Análisis y Relevamiento    :a1, 2026-03-01, 30d
    section Fase 2
    Diseño Arquitectura/UI     :a2, after a1, 30d
    section Fase 3
    Desarrollo Backend/Base    :a3, after a2, 90d
    section Fase 4
    Desarrollo Frontend/Integración :a4, after a3, 90d
    section Fase 5
    QA y Validaciones          :a5, after a4, 30d
    section Fase 6
    Capacitación y Despliegue  :a6, after a5, 30d
```

---
**Elaborado el:** 18 de Febrero de 2026
**Ubicación:** `documentacion/itinerario_produccion.md`
