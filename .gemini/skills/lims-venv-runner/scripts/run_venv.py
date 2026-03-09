import os
import sys
import subprocess
from pathlib import Path

def run():
    # 1. Locate project root (assuming this script is in .gemini/skills/lims-venv-runner/scripts/)
    # But wait, it's safer to use the current working directory if we assume the user runs from root.
    root = Path(os.getcwd())
    
    # 2. Paths
    venv_path = root / ".venv"
    if not venv_path.exists():
        # Try 'venv'
        venv_path = root / "venv"
    
    if not venv_path.exists():
        print(f"Error: Virtual environment not found in {root}", file=sys.stderr)
        sys.exit(1)
        
    python_exe = venv_path / "Scripts" / "python.exe" if os.name == "nt" else venv_path / "bin" / "python"
    
    if not python_exe.exists():
        print(f"Error: Python interpreter not found at {python_exe}", file=sys.stderr)
        sys.exit(1)
        
    # 3. Prepare Environment
    env = os.environ.copy()
    
    # Set PYTHONPATH
    src_path = str(root / "src")
    existing_pythonpath = env.get("PYTHONPATH", "")
    if existing_pythonpath:
        env["PYTHONPATH"] = f"{src_path}{os.pathsep}{existing_pythonpath}"
    else:
        env["PYTHONPATH"] = src_path
        
    # Ensure root is also in PYTHONPATH
    env["PYTHONPATH"] = f"{root}{os.pathsep}{env['PYTHONPATH']}"

    # 4. Command to run
    if len(sys.argv) < 2:
        # Default: run main.py
        args = [str(python_exe), "main.py"]
    else:
        # Pass through arguments
        # If the first argument is a python script, we prepend the python_exe
        first_arg = sys.argv[1]
        if first_arg.endswith(".py") or first_arg in ["pytest", "uvicorn", "alembic"]:
            if first_arg.endswith(".py"):
                args = [str(python_exe)] + sys.argv[1:]
            else:
                # Module mode: python -m module
                args = [str(python_exe), "-m"] + sys.argv[1:]
        else:
            args = sys.argv[1:]

    # 5. Execute
    try:
        result = subprocess.run(args, env=env, check=True)
        sys.exit(result.returncode)
    except subprocess.CalledProcessError as e:
        sys.exit(e.returncode)
    except Exception as e:
        print(f"Execution Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run()
