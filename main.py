import uvicorn

from src.backend.database.db_manager import db_manager


if __name__ == "__main__":
    # Ensure tables exist
    db_manager.init_db()

    # Start the API server
    uvicorn.run(
        "src.backend.api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
