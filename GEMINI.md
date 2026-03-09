# Proyecto LIMS - Context Document for Gemini CLI

## 1. Overview
El Sistema LIMS (Laboratory Information Management System) para URUFARMA S.A. es una plataforma digital centralizada diseñada para transitar del modelo analógico (papel) a una arquitectura digital automatizada, garantizando trazabilidad y cumplimiento normativo (GAMP 5 / 21 CFR Part 11).

## 2. Tech Stack
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy (ORM), Alembic (Migrations).
- **Database:** SQLite (Development) / PostgreSQL (Planned for Production).
- **Frontend:** React 18 (Vite), Tailwind CSS, Framer Motion (Animations), Axios.
- **Testing:**
  - **Backend:** Pytest (48/48 tests passing).
  - **Frontend:** Playwright (E2E testing in progress).
- **DevOps:** Docker (Planned), `docker-compose.yml` available.

## 3. Current State of Development (as of March 2026)

### 3.1 Core Modules (Backend & Frontend)
- **Authentication & Security:** 
  - ✅ JWT-based auth fully operational.
  - ✅ Backend RBAC (Role-Based Access Control) implemented via decorators.
  - ✅ Frontend `RoleGuard` component and `AuthContext` integrated.
- **Dashboard:**
  - ✅ Real-time metrics integration between Backend (`dashboard.py`) and Frontend (`DashboardHome.jsx`).
  - ✅ KPI visualization and charts.
- **Resources Management:**
  - ✅ **Plants/Locations:** Full CRUD implemented.
  - ✅ **Equipment/Instruments:** Full CRUD implemented, including state tracking.
- **Operations:**
  - ✅ **Samples:** Sampling session and sample unit management.
  - ✅ **Analysis:** Analytical methods, specifications, and result reporting.
  - ✅ **Manufacturing:** Orders and processes logic implemented in Backend; UI refined but logic-intensive.
- **Inventory:**
  - ✅ Management of culture media and reagents.

### 3.2 Recent Achievements
- **UI/UX:** Premium design with Glassmorphism, Dark Mode, and structural animations using Framer Motion.
- **Stability:** Resolved cyclic redirection issues in Frontend Auth.
- **Testing:** Established Playwright E2E testing framework with initial specs for Login, Navigation, and CRUDs.

## 4. Future Steps & Roadmap

### 🚀 Priority: High
1.  **Strict RBAC Enforcement:** Finish restricting UI elements (buttons, views) based on user roles (Admin, Supervisor, Operator, etc.).
2.  **Form Hardening:** Implement `Zod` or `react-hook-form` for strict validation in all data entry points to ensure GAMP-5 compliance.
3.  **Manufacturing Logic Completion:** Refine `ManufacturingPage.jsx` to ensure full traceability from raw materials to final batches.

### 📊 Priority: Medium
4.  **Full E2E Coverage:** Complete Playwright test suites for all modules to ensure stability during refactors.
5.  **Document Management:** Implement functionality to upload and index PDF reports/attachments (PRD 6.3).
6.  **Reporting & Exports:** Add real export capabilities (Excel/PDF) for analysts and supervisors.

### ⚙️ Priority: Low / Preparation
7.  **Production Readiness:** Finalize Docker configuration and migrate from SQLite to PostgreSQL.
8.  **Environment Cleanup:** Centralize all configuration in `.env` files and remove any remaining hardcoded URLs.

## 5. Reference Documentation
- `documentacion/prd.md`: Core requirements and scope.
- `documentacion/MER.mmd`: Database schema and relationships.
- `documentacion/onboarding_architecture.md`: System architectural overview.
