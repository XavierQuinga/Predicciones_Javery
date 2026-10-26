from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database.connection import Base

class PredictionRecord(Base):
    __tablename__ = "predicciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_consulta = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    tipo_equipo = Column(String(50), nullable=False, index=True)
    marca = Column(String(100), nullable=False, index=True)
    antiguedad_anios = Column(Float, nullable=True)
    sintoma = Column(Text, nullable=False)
    
    # Diagnóstico predicho
    falla_predicha = Column(String(100), nullable=False, index=True)
    confianza = Column(Float, nullable=False)
    porcentaje_confianza = Column(Float, nullable=False)
    
    # Top 3 de clases más probables
    top1_falla = Column(String(100), nullable=True)
    top1_confianza = Column(Float, nullable=True)
    top2_falla = Column(String(100), nullable=True)
    top2_confianza = Column(Float, nullable=True)
    top3_falla = Column(String(100), nullable=True)
    top3_confianza = Column(Float, nullable=True)
    
    # Información completa y estructurada
    probabilidades = Column(JSON, nullable=True)
    variables_entrada = Column(JSON, nullable=True)
    
    # Trazabilidad y gobierno de datos
    modelo_utilizado = Column(String(100), default="Random_Forest", nullable=False)
    version_modelo = Column(String(50), default="1.0.0", nullable=False)
    origen_registro = Column(String(50), default="PREDICCION_SISTEMA", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "fecha_consulta": self.fecha_consulta.isoformat() if self.fecha_consulta else None,
            "tipo_equipo": self.tipo_equipo,
            "marca": self.marca,
            "antiguedad_anios": self.antiguedad_anios,
            "sintoma": self.sintoma,
            "falla_predicha": self.falla_predicha,
            "confianza": self.confianza,
            "porcentaje_confianza": self.porcentaje_confianza,
            "top1_falla": self.top1_falla,
            "top1_confianza": self.top1_confianza,
            "top2_falla": self.top2_falla,
            "top2_confianza": self.top2_confianza,
            "top3_falla": self.top3_falla,
            "top3_confianza": self.top3_confianza,
            "top3": [
                {"falla": self.top1_falla, "confianza": self.top1_confianza, "porcentaje": round((self.top1_confianza or 0) * 100, 2)},
                {"falla": self.top2_falla, "confianza": self.top2_confianza, "porcentaje": round((self.top2_confianza or 0) * 100, 2)},
                {"falla": self.top3_falla, "confianza": self.top3_confianza, "porcentaje": round((self.top3_confianza or 0) * 100, 2)}
            ] if self.top1_falla else [],
            "modelo_utilizado": self.modelo_utilizado,
            "version_modelo": self.version_modelo,
            "origen_registro": self.origen_registro,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
