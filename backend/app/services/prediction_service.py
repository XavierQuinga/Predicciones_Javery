import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models.prediction import PredictionRecord
from app.schemas.prediction import PredictionRequest
from app.services.model_service import model_service

logger = logging.getLogger("diagnostico_ti.prediction_service")

class PredictionService:

    @staticmethod
    def create_prediction(db: Session, req: PredictionRequest) -> Dict[str, Any]:
        """
        Ejecuta el pipeline de inferencia y persiste el registro.

        La persistencia forma parte del flujo transaccional: si la base de datos
        rechaza el registro, la operación completa falla y la API responde con
        error en lugar de devolver una predicción aparentemente guardada con
        prediction_id=None.
        """
        # 1. Inferencia mediante el modelo
        resultado_ml = model_service.predict(
            tipo_equipo=req.tipo_equipo,
            marca=req.marca,
            antiguedad_anios=req.antiguedad_anios,
            sintoma=req.sintoma
        )

        top3 = resultado_ml.get("top3", [])
        top1_falla = top3[0]["falla"] if len(top3) > 0 else resultado_ml["falla_predicha"]
        top1_conf = top3[0]["confianza"] if len(top3) > 0 else resultado_ml["confianza"]
        top2_falla = top3[1]["falla"] if len(top3) > 1 else None
        top2_conf = top3[1]["confianza"] if len(top3) > 1 else None
        top3_falla = top3[2]["falla"] if len(top3) > 2 else None
        top3_conf = top3[2]["confianza"] if len(top3) > 2 else None

        # 2. Creación del objeto de registro para la base de datos
        db_record = PredictionRecord(
            tipo_equipo=req.tipo_equipo,
            marca=req.marca,
            antiguedad_anios=req.antiguedad_anios,
            sintoma=req.sintoma,
            falla_predicha=resultado_ml["falla_predicha"],
            confianza=resultado_ml["confianza"],
            porcentaje_confianza=resultado_ml["porcentaje_confianza"],
            top1_falla=top1_falla,
            top1_confianza=top1_conf,
            top2_falla=top2_falla,
            top2_confianza=top2_conf,
            top3_falla=top3_falla,
            top3_confianza=top3_conf,
            probabilidades=resultado_ml.get("probabilidades_completas"),
            variables_entrada={
                "tipo_equipo": req.tipo_equipo,
                "marca": req.marca,
                "antiguedad_anios": req.antiguedad_anios,
                "sintoma": req.sintoma
            },
            modelo_utilizado=resultado_ml["modelo_utilizado"],
            version_modelo=resultado_ml["version_modelo"],
            origen_registro="PREDICCION_SISTEMA"
        )

        try:
            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            prediction_id = db_record.id
            logger.info(
                "✓ Predicción guardada con ID: %s (Falla: %s, Confianza: %s%%)",
                prediction_id,
                db_record.falla_predicha,
                db_record.porcentaje_confianza
            )
        except Exception:
            db.rollback()
            logger.exception("Error al persistir la predicción en la base de datos")
            raise

        return {
            "prediction_id": prediction_id,
            "falla_predicha": resultado_ml["falla_predicha"],
            "falla_predicha_es": resultado_ml.get("falla_predicha_es", resultado_ml["falla_predicha"]),
            "confianza": resultado_ml["confianza"],
            "porcentaje_confianza": resultado_ml["porcentaje_confianza"],
            "top3": top3,
            "detalles_equipo": {
                "tipo_equipo": req.tipo_equipo,
                "marca": req.marca,
                "antiguedad_anios": req.antiguedad_anios,
                "sintoma": req.sintoma
            },
            "fecha_consulta": datetime.now(timezone.utc).isoformat(),
            "modelo_utilizado": resultado_ml["modelo_utilizado"],
            "version_modelo": resultado_ml["version_modelo"],
            "mensaje_confianza": resultado_ml["mensaje_confianza"],
            "nivel_confianza": resultado_ml.get("nivel_confianza"),
            "requiere_revision_tecnica": resultado_ml.get("requiere_revision_tecnica", False),
            "probabilidades_completas": resultado_ml.get("probabilidades_completas"),
            "dominance_ratio": resultado_ml.get("dominance_ratio"),
            "top2_acumulada": resultado_ml.get("top2_acumulada"),
            "total_clases_evaluadas": resultado_ml.get("total_clases_evaluadas", 19),
            "azar_base_porcentaje": resultado_ml.get("azar_base_porcentaje", 5.26)
        }

    @staticmethod
    def get_predictions(
        db: Session,
        search: Optional[str] = None,
        tipo_equipo: Optional[str] = None,
        falla_predicha: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Dict[str, Any]:
        """Consulta paginada del historial de diagnósticos con filtros."""
        query = db.query(PredictionRecord)

        if tipo_equipo:
            query = query.filter(PredictionRecord.tipo_equipo == tipo_equipo.strip().lower())
        if falla_predicha:
            query = query.filter(PredictionRecord.falla_predicha.ilike(f"%{falla_predicha.strip()}%"))
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                (PredictionRecord.marca.ilike(search_pattern)) |
                (PredictionRecord.sintoma.ilike(search_pattern)) |
                (PredictionRecord.falla_predicha.ilike(search_pattern))
            )

        total = query.count()
        total_pages = max(1, (total + page_size - 1) // page_size)
        offset = (page - 1) * page_size

        records = query.order_by(desc(PredictionRecord.fecha_consulta)).offset(offset).limit(page_size).all()

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "items": [r.to_dict() for r in records]
        }

    @staticmethod
    def get_prediction_by_id(db: Session, prediction_id: int) -> Optional[Dict[str, Any]]:
        record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
        if not record:
            return None
        return record.to_dict()

    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Calcula estadísticas generales para el panel y conexión Power BI."""
        total = db.query(func.count(PredictionRecord.id)).scalar() or 0
        total_sistema = db.query(func.count(PredictionRecord.id)).filter(
            PredictionRecord.origen_registro == "PREDICCION_SISTEMA"
        ).scalar() or 0
        total_historico = total - total_sistema

        avg_conf = db.query(func.avg(PredictionRecord.confianza)).scalar() or 0.0

        top_falla_query = db.query(
            PredictionRecord.falla_predicha,
            func.count(PredictionRecord.id).label("cnt")
        ).group_by(PredictionRecord.falla_predicha).order_by(desc("cnt")).first()

        falla_mas_frecuente = top_falla_query[0] if top_falla_query else None

        eq_counts = db.query(
            PredictionRecord.tipo_equipo,
            func.count(PredictionRecord.id)
        ).group_by(PredictionRecord.tipo_equipo).all()
        dist_equipo = {row[0]: row[1] for row in eq_counts}

        fallas_counts = db.query(
            PredictionRecord.falla_predicha,
            func.count(PredictionRecord.id).label("conteo"),
            func.avg(PredictionRecord.confianza).label("conf_prom")
        ).group_by(PredictionRecord.falla_predicha).order_by(desc("conteo")).limit(10).all()

        dist_fallas = [
            {
                "falla": row[0],
                "cantidad": row[1],
                "confianza_promedio": round(float(row[2] or 0) * 100, 2)
            }
            for row in fallas_counts
        ]

        ultimas = db.query(PredictionRecord).order_by(desc(PredictionRecord.fecha_consulta)).limit(5).all()

        return {
            "total_predicciones": total,
            "predicciones_sistema": total_sistema,
            "registros_historicos": total_historico,
            "falla_mas_frecuente": falla_mas_frecuente,
            "promedio_confianza": round(float(avg_conf) * 100, 2),
            "distribucion_tipo_equipo": dist_equipo,
            "distribucion_fallas": dist_fallas,
            "ultimas_predicciones": [r.to_dict() for r in ultimas]
        }
