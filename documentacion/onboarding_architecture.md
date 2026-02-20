# Arquitectura del Sistema LIMS - Guía de Onboarding

Este documento proporciona una visión general de la arquitectura del Laboratorio Information Management System (LIMS), orientada a nuevos integrantes del equipo.

## 1. Visión General de la Tecnología
El sistema está diseñado bajo una arquitectura de tres capas, utilizando tecnologías modernas y escalables:

*   **Lenguaje**: Python 3.10+
*   **Framework API**: FastAPI (Planificado/En desarrollo)
*   **Persistencia**: SQLAlchemy (ORM) con SQLite (Dev) / PostgreSQL (Prod)
*   **Frontend**: React (Planificado/En desarrollo)
*   **Estructura de Datos**: Modelo Relacional complejo (LIMS)

## 2. Estructura del Backend (src/backend)
El backend sigue el patrón **Service-Repository-Model**, lo que permite una clara separación de responsabilidades.

### Capa de Modelos (`src/backend/models`)
Define la estructura de la base de datos y las relaciones. Está organizada en dominios:
*   **dim_tables**: Tablas maestras de dimensiones (Planta, Area, Equipo, etc.).
*   **master**: Entidades principales del negocio (Producto, Especificacion, Metodo).
*   **fact**: Tablas de hechos y registros operativos (Recepcion, Analisis, Resultado).
*   **auth**: Gestión de Usuarios y Roles.
*   **inventory**: Gestión de Medios de cultivo y reactivos.

### Capa de Repositorios (`src/backend/repositories`)
Actúa como la capa de abstracción de datos (DAL).
*   **BaseRepository**: Clase genérica que provee métodos CRUD estándar (create, get, update, delete).
*   **Repositorios Específicos**: Heredan de `BaseRepository` y pueden añadir lógica de consulta personalizada.
*   **Auditoría**: Algunos repositorios integran lógica regulatoria para el rastro de auditoría (*Audit Trail*).

### Capa de Servicios (`src/backend/services`)
Contiene la **lógica de negocio**.
*   Orquesta las llamadas a múltiples repositorios.
*   Realiza validaciones de reglas de negocio (ej. estados permitidos para un análisis).
*   Gestiona transacciones y eventos (ej. registrar historial al cambiar un estado).

## 3. API y Comunicación (Planificado)
Según los requisitos técnicos, se utilizará **FastAPI** para exponer la lógica de los servicios a través de una API REST.
*   La comunicación será principalmente vía JSON.
*   Se implementará seguridad basada en roles (RBAC).

## 4. Estructura del Frontend (Planificado)
El cliente se desarrollará en **React**, con una arquitectura basada en componentes.
*   Se comunicará con el Backend exclusivamente a través de la API REST.
*   Enfoque en diseño responsivo y UX intuitiva para operadores de laboratorio.

## 5. Flujo de Datos Típico
1.  El **Frontend** hace una solicitud a un endpoint de la **API (FastAPI)**.
2.  La API llama al **Servicio** correspondiente.
3.  El **Servicio** valida la lógica y solicita/persiste datos a través del **Repositorio**.
4.  El **Repositorio** usa **SQLAlchemy** para interactuar con la **Base de Datos**.
5.  La respuesta fluye de vuelta en sentido inverso.

## 6. Base de Datos (MER)
El Modelo de Entidad-Relación (MER.mmd) es el núcleo del sistema, cubriendo desde la recepción de muestras hasta la aprobación final y el rastro de auditoría, cumpliendo con normativas regulatorias (como GxP/21 CFR Part 11).
