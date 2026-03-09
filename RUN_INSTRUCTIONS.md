# Guía de Ejecución y Pruebas - Proyecto LIMS

Esta guía proporciona las instrucciones necesarias para ejecutar la aplicación, realizar migraciones y correr las suites de pruebas utilizando **PowerShell** en Windows.

## 📋 Requisitos Previos

- **Python 3.10+** (instalado y en el PATH).
- **Node.js 18+** y **npm** (instalado y en el PATH).
- **Entorno Virtual:** Asegúrate de que el directorio `.venv` existe en la raíz del proyecto.
- **Terminal:** Se recomienda utilizar **PowerShell 7+** o el integrado en VS Code (configurado como PowerShell).

---

## 🚀 Ejecución de la Aplicación

### 1. Servidor Backend (FastAPI)
Para iniciar el backend con recarga automática, utiliza el wrapper `run_venv.py`:

```powershell
# Iniciar el backend (PS)
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py uvicorn src.backend.api.app:app --reload
```

### 2. Cliente Frontend (React + Vite)
Desde la raíz del proyecto, navega al directorio frontend e inicia el servidor de desarrollo:

```powershell
# Instalar dependencias e iniciar (PS)
cd src/frontend ; npm install ; npm run dev -- --host
```

> [!TIP]
> Usar `-- --host` asegura que el servidor de Vite sea accesible desde `127.0.0.1:5173` en entornos restringidos o contenedores.

---

## 🛠️ Base de Datos y Migraciones

El proyecto utiliza **Alembic** para gestionar el esquema de la base de datos (SQLite por defecto).

```powershell
# Aplicar todas las migraciones pendientes
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py alembic upgrade head

# Crear una nueva migración (ejemplo)
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py alembic revision --autogenerate -m "descripción del cambio"

# Verificar el estado de la DB
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py python scripts/list_states.py
```

---

## 🧪 Ejecución de Pruebas

### 1. Pruebas de Backend (Pytest)
Ejecuta la suite completa de pruebas unitarias e integración del backend:

```powershell
# Ejecutar todas las pruebas del backend
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py pytest

# Ejecutar un archivo de prueba específico
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py pytest tests/test_auth_api.py
```

### 2. Pruebas E2E de Frontend (Playwright)
Asegúrate de que tanto el **Backend** como el **Frontend** estén en ejecución antes de lanzar las pruebas E2E (o usa el modo UI de Playwright).

```powershell
# Navegar al frontend y ejecutar pruebas headless
cd src/frontend ; npx playwright test

# Ejecutar con interfaz de usuario (Recomendado para debugging)
cd src/frontend ; npx playwright test --ui
```

---

## 🔧 Comandos Útiles de Mantenimiento

### Limpieza de Cache y Logs
```powershell
# Borrar archivos temporales de python y logs
Remove-Item -Path "**/__pycache__", "**/.pytest_cache" -Recurse -Force ; Remove-Item -Path "logs/*.log*" -Force
```

### Verificación de Roles y Admin
```powershell
# Verificar si el usuario admin existe y tiene roles correctos
python .\.gemini\skills\lims-venv-runner\scripts\run_venv.py python verify_admin_roles.py
```

---

## 🆘 Solución de Problemas (Troubleshooting)

### El Frontend no carga o da "Connection Refused"
1. Asegúrate de estar usando `npm run dev -- --host`.
2. Verifica que no haya otro proceso usando el puerto 5173 (`Stop-Process` o cambia el puerto en `vite.config.js`).
3. Si `npm run dev` falla inmediatamente con un error de dependencias, intenta:
   ```powershell
   cd src/frontend ; rm -rf node_modules ; npm install ; npm run dev -- --host
   ```

### Error de Conexión al Backend
1. Verifica que el backend esté corriendo en el puerto 8000.
2. Prueba acceder a [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). Si carga, el backend está OK.
3. Revisa el archivo `.env` y asegúrate de que `DATABASE_URL` sea correcta.

---

## 💡 Notas Importantes para PowerShell

1. **Separador de Comandos:** Utiliza siempre `;` para encadenar comandos en lugar de `&&`.
2. **Rutas:** Utiliza el backslash `\` para rutas de archivos o asegúrate de que PowerShell interprete correctamente los paths relativos.
3. **Scripts de Skill:** El proyecto incluye un wrapper en `.gemini/skills/lims-venv-runner/scripts/run_venv.py` que configura automáticamente el `PYTHONPATH` y activa el `.venv` para cada comando de Python.
