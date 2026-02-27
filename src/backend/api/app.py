from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.api.routers import auth, equipment, locations, manufacturing, samples, analysis, inventory, dashboard, documents, exports
from src.backend.core.logging import setup_logging, get_logger

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""
    setup_logging()
    logger.info("Starting LIMS URUFARMA API")

    app = FastAPI(
        title="LIMS URUFARMA - API",
        description="""
        Sistema de Gestión de Información de Laboratorio (LIMS) para URUFARMA.
        Permite la gestión de equipos, plantas, procesos de manufactura, muestreo y análisis técnico.
        """,
        version="0.1.0",
        contact={
            "name": "Soporte Técnico LIMS",
            "email": "soporte@urufarma.com.uy",
        },
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
    app.include_router(auth.router, prefix="/api/auth", tags=["Seguridad & Autenticación"])
    app.include_router(equipment.router, prefix="/api/equipos", tags=["Maestros - Equipos"])
    app.include_router(locations.router, prefix="/api/ubicaciones", tags=["Maestros - Ubicaciones"])
    app.include_router(manufacturing.router, prefix="/api/manufactura", tags=["Procesos - Manufactura"])
    app.include_router(samples.router, prefix="/api/muestreo", tags=["Operaciones - Muestreo"])
    app.include_router(analysis.router, prefix="/api/analisis", tags=["Operaciones - Análisis"])
    app.include_router(inventory.router, prefix="/api/inventario", tags=["Maestros - Inventario"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
    app.include_router(documents.router, prefix="/api/documentos", tags=["Documentos y Adjuntos"])
    app.include_router(exports.router, prefix="/api/exports", tags=["Exportaciones CSV"])

    # Global Exception Handlers
    from fastapi import Request
    from fastapi.responses import JSONResponse
    from fastapi import HTTPException as FastAPIHTTPException
    from src.backend.core.exceptions import LIMSException

    @app.exception_handler(LIMSException)
    async def lims_exception_handler(request: Request, exc: LIMSException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.__class__.__name__,
                "message": exc.message,
                "status_code": exc.status_code
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=400,
            content={"error": "Petición Incorrecta", "message": str(exc)},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Error Interno del Servidor", "message": str(exc)},
        )

    # También manejamos la excepción base de Starlette para capturar 404s y otros errores de bajo nivel
    from starlette.exceptions import HTTPException as StarletteHTTPException
    @app.exception_handler(StarletteHTTPException)
    async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "Error de HTTP", "message": exc.detail},
        )

    @app.get("/", tags=["Root"])
    def root():
        return {"message": "LIMS URUFARMA API v0.1.0"}

    return app


app = create_app()
