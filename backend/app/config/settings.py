import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Modelo ML
    MODEL_PATH: str = Field(
        default="03_MODELO/mejor_modelo_diagnostico_fallas.joblib",
        description="Ruta al archivo .joblib del pipeline entrenado"
    )
    METADATA_PATH: str = Field(
        default="backend/ml/metadata.json",
        description="Ruta a los metadatos JSON del modelo"
    )
    
    # Base de Datos PostgreSQL
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "diagnostico_ti"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_SSLMODE: str = "prefer"
    DATABASE_URL: Optional[str] = None
    
    # Fallback seguro a SQLite si PostgreSQL no está disponible localmente
    ALLOW_SQLITE_FALLBACK: bool = True
    SQLITE_DB_PATH: str = "backend/diagnostico_local.db"
    
    # Power BI Dashboard URL
    POWERBI_DASHBOARD_URL: str = "https://app.powerbi.com"
    
    # Seguridad / CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    @property
    def postgres_connection_string(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
