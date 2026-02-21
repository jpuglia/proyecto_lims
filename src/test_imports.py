import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from src.backend.models import Base
    from src.backend.repositories import *
    from src.backend.services import *
    
    print("All models, repositories and services imported successfully!")
    print(f"Total tables detected by SQLAlchemy: {len(Base.metadata.tables)}")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
