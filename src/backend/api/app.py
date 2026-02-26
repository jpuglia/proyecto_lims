from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.api.routers import auth, equipment, manufacturing, samples, analysis, inventory


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""

    app = FastAPI(
        title="LIMS URUFARMA",
        description="Sistema de Gestión de Información de Laboratorio",
        version="0.1.0",
    )

    # CORS – permitir todos los orígenes en desarrollo
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
    app.include_router(equipment.router, prefix="/api/equipos", tags=["Equipos"])
    app.include_router(manufacturing.router, prefix="/api/manufactura", tags=["Manufactura"])
    app.include_router(samples.router, prefix="/api/muestreo", tags=["Muestreo"])
    app.include_router(analysis.router, prefix="/api/analisis", tags=["Análisis"])
    app.include_router(inventory.router, prefix="/api/inventario", tags=["Inventario"])

    @app.get("/", tags=["Root"])
    def root():
        return {"message": "LIMS URUFARMA API v0.1.0"}

    return app


app = create_app()
