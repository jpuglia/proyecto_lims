# Arquitectura del Sistema LIMS - Guía de Onboarding

Este documento proporciona una visión general de la arquitectura del Laboratorio Information Management System (LIMS), orientada a nuevos integrantes del equipo.

## 1. Visión General de la Tecnología
El sistema está diseñado bajo una arquitectura de tres capas, utilizando tecnologías modernas y escalables:

*   **Lenguaje**: Python 3.10+
*   **Framework API**: FastAPI (Operacional)
*   **Persistencia**: SQLAlchemy (ORM) con SQLite (Dev) / PostgreSQL (Prod)
*   **Frontend**: React 18 con Vite (Operacional)
*   **Estructura de Datos**: Modelo Relacional complejo (LIMS)

## 2. Estructura del Backend (src/backend)
El backend sigue el patrón **Service-Repository-Model**, lo que permite una clara separación de responsabilidades. Actualmente cuenta con una cobertura de pruebas del 100% (48/48 tests pasando).

### Capa de Modelos (`src/backend/models`)
Define la estructura de la base de datos y las relaciones. Está organizada en dominios:
*   **dim_tables**: Tablas maestras de dimensiones (Planta, Area, Equipo, etc.).
*   **master**: Entidades principales del negocio (Producto, Especificacion, Metodo).
*   **fact**: Tablas de hechos y registros operativos (Recepcion, Analisis, Resultado).
*   **auth**: Gestión de Usuarios y Roles (RBAC implementado).
*   **inventory**: Gestión de Medios de cultivo y reactivos.

### Capa de Repositorios (`src/backend/repositories`)
Actúa como la capa de abstracción de datos (DAL).
*   **BaseRepository**: Clase genérica que provee métodos CRUD estándar (create, get, update, delete).
*   **Repositorios Específicos**: Heredan de `BaseRepository` y proveen consultas personalizadas.
*   **Auditoría**: Los repositorios integran lógica para el rastro de auditoría (*Audit Trail*) mediante decoradores.

### Capa de Servicios (`src/backend/services`)
Contiene la **lógica de negocio**.
*   Orquesta las llamadas a múltiples repositorios.
*   Realiza validaciones de reglas de negocio (GxP / GAMP 5).
*   Gestiona transacciones y eventos.

## 3. API y Comunicación
Se utiliza **FastAPI** para exponer la lógica de los servicios a través de una API REST.
*   **Seguridad**: Autenticación basada en JWT y autorización por roles (RBAC) mediante decoradores.
*   **Documentación**: Autogenerada vía Swagger UI (`/docs`).
*   **Routers**: Organizados por módulos (auth, equipment, locations, manufacturing, samples, analysis, inventory, dashboard).

## 4. Estructura del Frontend
El cliente está desarrollado en **React 18** con **Vite** y **Tailwind CSS**.
*   **UI/UX**: Diseño Premium con Glassmorphism y Dark Mode.
*   **Animaciones**: Integración de **Framer Motion** para transiciones fluidas entre páginas.
*   **Seguridad**: `AuthContext` para gestión de sesión y `RoleGuard` para protección de rutas y componentes.
*   **Dashboard**: Integración en tiempo real con métricas analíticas del backend.

## 5. Estrategia de Testing
El proyecto prioriza la calidad y estabilidad mediante:
*   **Backend**: Suite de pruebas unitarias e integración con **Pytest**.
*   **Frontend**: Pruebas de extremo a extremo (E2E) con **Playwright**, cubriendo flujos críticos como Login, Navegación y CRUDs.

## 6. Flujo de Datos Típico
1.  El **Frontend** hace una solicitud a un endpoint de la **API (FastAPI)**.
2.  La API llama al **Servicio** correspondiente.
3.  El **Servicio** valida la lógica y solicita/persiste datos a través del **Repositorio**.
4.  El **Repositorio** usa **SQLAlchemy** para interactuar con la **Base de Datos**.
5.  La respuesta fluye de vuelta en sentido inverso.

## 6. Base de Datos (MER)
El Modelo de Entidad-Relación (MER.mmd) es el núcleo del sistema, cubriendo desde la recepción de muestras hasta la aprobación final y el rastro de auditoría, cumpliendo con normativas regulatorias (como GxP/21 CFR Part 11).
