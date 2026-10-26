from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class PredictionRequest(BaseModel):
    tipo_equipo: str = Field(..., description="Categoría del equipo ('laptop' o 'desktop')")
    marca: str = Field(default="Sin marca", description="Fabricante del equipo")
    antiguedad_anios: Optional[float] = Field(default=None, ge=0, le=50, description="Años desde su fabricación")
    sintoma: str = Field(..., min_length=3, description="Descripción del problema o síntoma observado")

    @field_validator("tipo_equipo")
    @classmethod
    def validate_tipo_equipo(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ["laptop", "desktop"]:
            raise ValueError("El tipo de equipo debe ser 'laptop' o 'desktop'")
        return v_clean

    @field_validator("marca")
    @classmethod
    def validate_marca(cls, v: str) -> str:
        if not v or not v.strip():
            return "Sin marca"
        return v.strip()

    @field_validator("sintoma")
    @classmethod
    def validate_sintoma(cls, v: str) -> str:
        v_clean = v.strip()
        if len(v_clean) < 3:
            raise ValueError("El síntoma debe tener al menos 3 caracteres descriptivos")
        return v_clean

class ClassProbability(BaseModel):
    falla: str
    falla_es: Optional[str] = None
    confianza: float
    porcentaje: float

class PredictionResponse(BaseModel):
    prediction_id: int
    falla_predicha: str
    falla_predicha_es: Optional[str] = None
    confianza: float
    porcentaje_confianza: float
    top3: List[ClassProbability]
    detalles_equipo: Dict[str, Any]
    fecha_consulta: str
    modelo_utilizado: str
    version_modelo: str
    mensaje_confianza: str
    nivel_confianza: Optional[str] = None
    requiere_revision_tecnica: bool = False
    probabilidades_completas: Optional[Dict[str, float]] = None
    dominance_ratio: Optional[float] = None
    top2_acumulada: Optional[float] = None
    total_clases_evaluadas: Optional[int] = 19
    azar_base_porcentaje: Optional[float] = 5.26

class ModelInfoResponse(BaseModel):
    nombre_modelo: str
    tipo_algoritmo: str
    version: str
    fecha_entrenamiento: str
    framework: str
    num_clases: int
    clases: List[str]
    columnas_entrada: List[str]
    metricas_mejor_modelo: Dict[str, Any]
    comparativa_algoritmos: List[Dict[str, Any]]
    metricas_por_clase: List[Dict[str, Any]]

class SymptomExample(BaseModel):
    titulo: str
    sintoma: str
    tipo_equipo: str
    marca: str
    antiguedad_anios: Optional[float]

class FeaturesResponse(BaseModel):
    tipos_equipo: List[str]
    marcas: List[str]
    marcas_destacadas: List[str]
    antiguedad_anios_default: float
    antiguedad_anios_min: float
    antiguedad_anios_max: float
    ejemplos_sintomas: List[SymptomExample]

class PredictionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[Dict[str, Any]]

class DashboardStatsResponse(BaseModel):
    total_predicciones: int
    predicciones_sistema: int
    registros_historicos: int
    falla_mas_frecuente: Optional[str]
    promedio_confianza: float
    distribucion_tipo_equipo: Dict[str, int]
    distribucion_fallas: List[Dict[str, Any]]
    ultimas_predicciones: List[Dict[str, Any]]
