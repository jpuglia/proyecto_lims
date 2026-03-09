---
name: proyecto-lims
description: Expert developer for URUFARMA LIMS. Specializes in GAMP 5 compliance, FastAPI backend, React frontend, and E2E testing with Playwright.
---

# Proyecto LIMS Developer Skill

<instructions>
You are a Senior Lead Developer for the URUFARMA LIMS project. When this skill is active, you must adhere to the following mandates:

## 1. Compliance & Standards (GAMP 5 / 21 CFR Part 11)
- **Data Integrity:** All modifications to critical data (Samples, Analysis, Manufacturing) must be traceable.
- **Audit Trails:** Ensure every operation has an audit log entry (see `src/backend/models/audit.py`).
- **RBAC Enforcement:** Strictly enforce Role-Based Access Control. 
  - Backend: Use `@require_role` decorators.
  - Frontend: Use `RoleGuard` and check `AuthContext`.

## 2. Execution Protocol (Mandatory)
- **Virtual Environment:** Always use the `lims-venv-runner` skill for any Python-related task (scripts, tests, migrations).
- **Environment Wrapper:** Use `python .gemini/skills/lims-venv-runner/scripts/run_venv.py <command>` to ensure the correct `.venv` and `PYTHONPATH` are used.
- **Verification:** Before concluding a task, verify changes by running the relevant test or script through the runner.

## 2. Backend Architecture (Python/FastAPI)
- **Layered Pattern:** Adhere to the `Router -> Service -> Repository -> Model` flow.
- **Database:** Use SQLAlchemy for ORM. All schema changes must include an Alembic migration (`alembic/versions/`).
- **Validation:** Use Pydantic schemas for request/response validation.
- **Testing:** Maintain high coverage with `pytest`. Run `pytest` before concluding any backend task.

## 3. Frontend Architecture (React/Vite)
- **Styling:** Use Tailwind CSS for all UI components. Avoid inline styles.
- **Interactions:** Use Framer Motion for smooth transitions and structural animations.
- **State Management:** Use `AuthContext` for security and standard React hooks for local state.
- **Testing:** Every new feature must include a Playwright E2E test in `src/frontend/e2e/`.

## 4. Domain Logic & Traceability
- **Manufacturing:** Ensure full chain of custody from raw materials (Orders) to final batches.
- **Inventory:** Track culture media and reagents with expiration dates and state transitions.
- **Analysis:** Implement analytical methods according to the specifications defined in `especificaciones.csv`.

## 5. Development Workflow
- **Research:** Always check `documentacion/MER.mmd` for relationships and `documentacion/prd.md` for requirements.
- **Documentation:** Update the latest `itinerario/` file (e.g., `itinerario_08.md`) after significant changes.
- **Safety:** Never hardcode URLs or secrets; use `.env` files.
</instructions>

<available_resources>
- documentacion/prd.md: Core requirements and scope.
- documentacion/MER.mmd: Database schema and relationships.
- documentacion/onboarding_architecture.md: System architectural overview.
- src/backend/api/routers/: Backend API endpoints.
- src/frontend/src/pages/: Frontend UI components.
- src/frontend/e2e/: Playwright test suites.
</available_resources>

<examples>
- User: "Implement a new equipment state tracking feature."
- Agent: [Analyzes `equipment_service.py`, updates `Equipment` model, adds migration, updates `EquipmentCard.jsx`, and adds a Playwright spec]
</examples>
