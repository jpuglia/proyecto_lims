---
name: lims-venv-runner
description: Project execution manager for URUFARMA LIMS. Ensures all Python commands (scripts, tests, migrations) use the project's virtual environment and correct PYTHONPATH. Use whenever you need to execute backend code.
---

# Project Venv Runner

This skill ensures that all execution tasks are performed in the correct environment to avoid configuration errors (e.g., using system Python instead of project's .venv).

## Mandates

1. **Always use the project's .venv**: Never use the system `python` or `pip`.
2. **Set PYTHONPATH**: Ensure `src` and the project root are in `PYTHONPATH` for all executions.
3. **Execution Tool**: Use the provided `run_venv.py` script as a wrapper whenever possible.
4. **Shell Syntax**: On Windows, prioritize PowerShell-compatible syntax (backslashes and proper quoting).
5. **PowerShell Separator**: NEVER use `&&` as a statement separator in PowerShell. Always use `;` (semicolon) to chain multiple commands.

## Workflows

### 1. Running Backend Scripts
To run any script (e.g., `main.py`, `scripts/verify_workflow.py`):

**Windows (PowerShell):**
```powershell
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py <script_path> [args...]
```

**Unix:**
```bash
python .gemini/skills/lims-venv-runner/scripts/run_venv.py <script_path> [args...]
```

### 2. Running Tests
To run pytest:

**Windows (PowerShell):**
```powershell
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py pytest [args...]
```

**Unix:**
```bash
python .gemini/skills/lims-venv-runner/scripts/run_venv.py pytest [args...]
```

### 3. Database Migrations
To run alembic:

**Windows (PowerShell):**
```powershell
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py alembic [args...]
```

**Unix:**
```bash
python .gemini/skills/lims-venv-runner/scripts/run_venv.py alembic [args...]
```

### 4. Running the API
To start the API (via uvicorn):

**Windows (PowerShell):**
```powershell
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py uvicorn src.backend.api.app:app --reload
```

**Unix:**
```bash
python .gemini/skills/lims-venv-runner/scripts/run_venv.py uvicorn src.backend.api.app:app --reload
```

### 5. Manual Packaging (Windows)
If the standard `package_skill.cjs` tool fails due to `tar` or `zip` issues, use PowerShell to create the `.skill` file manually:
```powershell
# Run from .gemini/skills/lims-venv-runner/
# PowerShell requires .zip extension during compression
Compress-Archive -Path scripts, SKILL.md -DestinationPath .\dist\lims-venv-runner.zip -Force; Move-Item .\dist\lims-venv-runner.zip .\dist\lims-venv-runner.skill -Force
```

## Troubleshooting
If you encounter `ModuleNotFoundError`, ensure the `run_venv.py` script is correctly appending `src` to the environment.
If you get "Virtual environment not found", check that `.venv` exists in the project root.
On Windows, if paths fail, ensure you are using backslashes `\` or properly escaped forward slashes in PowerShell.
