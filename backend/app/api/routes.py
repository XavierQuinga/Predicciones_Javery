import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.connection import get_db, get_db_status
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    ModelInfoResponse,
    FeaturesResponse,
    PredictionListResponse,
    DashboardStatsResponse
)
from app.services.model_service import model_service
from app.services.prediction_service import PredictionService

logger = logging.getLogger("diagnostico_ti.api")

router = APIRouter()

@router.get("/health", summary="Estado de salud de la API, modelo ML y Base de Datos")
def health_check():
    db_status = get_db_status()
    model_loaded = model_service.is_loaded
    db_connected = bool(db_status.get("connected"))
    return {
        "status": "healthy" if model_loaded and db_connected else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model": {
            "loaded": model_loaded,
            "algorithm": model_service.metadata.get("tipo_algoritmo", "RandomForestClassifier"),
            "classes_count": len(model_service.classes)
        },
        "database": db_status
    }

@router.get("/model/info", response_model=ModelInfoResponse, summary="Información del modelo y métricas de evaluación")
def get_model_info():
    return model_service.get_info()

@router.get("/model/features", response_model=FeaturesResponse, summary="Variables de entrada, rangos y categorías permitidas")
def get_model_features():
    return model_service.get_allowed_features()

@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK, summary="Ejecutar diagnóstico predictivo")
def predict_fault(request: PredictionRequest, db: Session = Depends(get_db)):
    try:
        return PredictionService.create_prediction(db=db, req=request)
    except Exception:
        logger.exception("Error al procesar o persistir la predicción")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No fue posible completar y registrar la predicción. Revise el estado del servicio e inténtelo nuevamente."
        )

@router.get("/predictions", response_model=PredictionListResponse, summary="Listar historial de predicciones con paginación")
def list_predictions(
    search: Optional[str] = Query(None, description="Búsqueda por texto en síntoma, marca o falla"),
    tipo_equipo: Optional[str] = Query(None, description="Filtrar por laptop o desktop"),
    falla: Optional[str] = Query(None, description="Filtrar por tipo de falla predicha"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Registros por página"),
    db: Session = Depends(get_db)
):
    try:
        return PredictionService.get_predictions(
            db=db,
            search=search,
            tipo_equipo=tipo_equipo,
            falla_predicha=falla,
            page=page,
            page_size=page_size
        )
    except Exception:
        logger.exception("Error al obtener el historial")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al consultar el historial en la base de datos."
        )

@router.get("/predictions/{prediction_id}", summary="Obtener el detalle de una predicción específica")
def get_prediction_detail(prediction_id: int, db: Session = Depends(get_db)):
    prediction = PredictionService.get_prediction_by_id(db=db, prediction_id=prediction_id)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la predicción con ID {prediction_id}"
        )
    return prediction

@router.get("/dashboard/stats", response_model=DashboardStatsResponse, summary="Métricas estadísticas consolidadas")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        return PredictionService.get_dashboard_stats(db=db)
    except Exception:
        logger.exception("Error al obtener estadísticas del dashboard")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar las estadísticas del dashboard."
        )

@router.get("/powerbi/config", summary="Enlace y configuración del dashboard de Power BI")
def get_powerbi_config():
    return {
        "dashboard_url": settings.POWERBI_DASHBOARD_URL,
        "vista_sql_recomendada": "vw_powerbi_predicciones",
        "motor_origen": "PostgreSQL",
        "servidor_local": f"{settings.DB_HOST}:{settings.DB_PORT}",
        "base_datos": settings.DB_NAME,
        "usuario": settings.DB_USER,
        "descripcion": "Tablero gerencial y operativo conectado directamente a PostgreSQL para monitoreo continuo."
    }

@router.post("/powerbi/launch-desktop", summary="Iniciar Power BI Desktop en desarrollo local")
def launch_powerbi_desktop():
    # Esta acción ejecuta un proceso del sistema operativo. Solo se habilita
    # explícitamente en modo DEBUG para evitar ejecución remota en producción.
    if not settings.DEBUG:
        return {
            "success": False,
            "message": "El inicio remoto de Power BI Desktop está deshabilitado fuera del modo de desarrollo local."
        }

    import subprocess
    import platform

    if platform.system() != "Windows":
        return {
            "success": False,
            "message": "Power BI Desktop nativo solo opera en Windows. Para otros sistemas operativos, use la opción del navegador."
        }
    try:
        subprocess.Popen(
            ["powershell.exe", "-Command", "Start-Process PBIDesktopStore.exe -ErrorAction SilentlyContinue"],
            shell=False
        )
        return {
            "success": True,
            "message": "Power BI Desktop se está iniciando en su computadora."
        }
    except Exception:
        logger.exception("Error al iniciar Power BI Desktop")
        return {
            "success": False,
            "message": "No se pudo iniciar Power BI Desktop automáticamente. Ábralo manualmente desde Windows."
        }
