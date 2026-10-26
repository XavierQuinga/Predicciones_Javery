import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import os
import sys

# Asegurar que el directorio backend esté en sys.path para importar app.*
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config.settings import settings
from app.database.connection import init_db_engine
from app.services.model_service import model_service
from app.api.routes import router as api_router

# Configuración de Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("diagnostico_ti")


def _resolve_dashboard_path():
    """Localiza el dashboard HTML tanto en desarrollo como en Docker/Railway."""
    filename = "DASHBOARD_PREVISUALIZACION_JAVERY.html"
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..")
    )
    candidates = [
        os.path.join(project_root, "07_POWER_BI", filename),
        os.path.join("/app", "07_POWER_BI", filename),
        os.path.join(os.getcwd(), "07_POWER_BI", filename),
    ]

    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate

    logger.error(
        "Dashboard interactivo no encontrado. Rutas verificadas: %s",
        candidates,
    )
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Evento de Inicio (Startup)
    logger.info("Iniciando %s v%s...", settings.PROJECT_NAME, settings.VERSION)

    # 1. Inicializar base de datos
    try:
        init_db_engine()
    except Exception as e:
        logger.error("Aviso en la inicialización de base de datos: %s", e)

    # 2. Cargar pipeline de Machine Learning en memoria
    try:
        model_service.load_model()
    except Exception as e:
        logger.critical("Error al cargar el modelo de Machine Learning: %s", e, exc_info=True)
        raise e

    dashboard_path = _resolve_dashboard_path()
    if dashboard_path:
        logger.info("✓ Dashboard interactivo disponible en: %s", dashboard_path)
    else:
        logger.warning("Dashboard interactivo no disponible en este despliegue.")

    logger.info("✓ Sistema listo para atender peticiones en %s:%d", settings.HOST, settings.PORT)
    yield
    # Evento de Apagado (Shutdown)
    logger.info("Deteniendo servidor...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API REST para diagnóstico predictivo de fallas en laptops y desktops mediante Machine Learning.",
    lifespan=lifespan
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador global de excepciones no controladas (seguridad: sin exponer stack traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Excepción no controlada en %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ha ocurrido un error interno en el servidor. El evento ha sido registrado."}
    )

# Registrar rutas de la API
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/dashboard-inteligente", summary="Servir el Dashboard Inteligente Interactivo de JAVERY")
def get_intelligent_dashboard():
    dashboard_path = _resolve_dashboard_path()
    if not dashboard_path:
        return JSONResponse(
            status_code=404,
            content={
                "detail": "Archivo del dashboard interactivo no encontrado en el despliegue actual."
            },
        )

    return FileResponse(
        dashboard_path,
        media_type="text/html",
        filename=None,
        headers={"Cache-Control": "no-store"},
    )


@app.get("/dashboard-inteligente/status", summary="Comprobar disponibilidad del Dashboard Inteligente")
def dashboard_status():
    dashboard_path = _resolve_dashboard_path()
    return {
        "available": dashboard_path is not None,
        "route": "/dashboard-inteligente",
    }


@app.get("/", summary="Ruta raíz con información del servicio")
def root():
    return {
        "sistema": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "estado": "operativo",
        "documentacion_swagger": "/docs",
        "documentacion_redoc": "/redoc",
        "endpoints_principales": {
            "health": f"{settings.API_PREFIX}/health",
            "features": f"{settings.API_PREFIX}/model/features",
            "info_modelo": f"{settings.API_PREFIX}/model/info",
            "predecir": f"{settings.API_PREFIX}/predict",
            "historial": f"{settings.API_PREFIX}/predictions",
            "estadisticas": f"{settings.API_PREFIX}/dashboard/stats",
            "dashboard_inteligente": "/dashboard-inteligente",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
