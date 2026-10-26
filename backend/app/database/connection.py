import os
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config.settings import settings

logger = logging.getLogger("diagnostico_ti.database")

Base = declarative_base()

engine = None
SessionLocal = None
is_postgres = False

def init_db_engine():
    global engine, SessionLocal, is_postgres
    pg_url = settings.postgres_connection_string
    
    # Intentar conexión a PostgreSQL primero
    try:
        logger.info("Verificando conexión con PostgreSQL: %s:%s/%s", 
                    settings.DB_HOST, settings.DB_PORT, settings.DB_NAME)
        # Timeout corto para no bloquear el inicio si no hay servidor levantado
        test_engine = create_engine(
            pg_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        engine = test_engine
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        is_postgres = True
        logger.info("✓ Conexión exitosa a PostgreSQL central.")
    except Exception as e:
        logger.warning("No se pudo conectar a PostgreSQL (%s).", str(e))
        if settings.ALLOW_SQLITE_FALLBACK:
            # Resolver ruta absoluta para que funcione sin importar el CWD
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            sqlite_file = os.path.abspath(os.path.join(base_dir, "diagnostico_local.db"))
            os.makedirs(os.path.dirname(sqlite_file), exist_ok=True)
            sqlite_url = f"sqlite:///{sqlite_file}"
            logger.info("Activando fallback seguro SQLite para desarrollo local en: %s", sqlite_url)
            engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            is_postgres = False
        else:
            raise ConnectionError(f"Error crítico: Base de datos PostgreSQL no accesible y fallback deshabilitado: {e}")

    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    logger.info("Esquema de tablas verificado y sincronizado.")

def get_db() -> Generator[Session, None, None]:
    """Generador de sesiones de base de datos para inyección en FastAPI."""
    if SessionLocal is None:
        init_db_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_status() -> dict:
    """Retorna el estado de salud de la base de datos."""
    if engine is None:
        return {"status": "uninitialized", "motor": "none", "connected": False}
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "motor": "PostgreSQL" if is_postgres else "SQLite (Fallback local)",
            "host": settings.DB_HOST if is_postgres else "Local file",
            "database": settings.DB_NAME if is_postgres else settings.SQLITE_DB_PATH,
            "connected": True
        }
    except Exception as ex:
        return {
            "status": "error",
            "motor": "PostgreSQL" if is_postgres else "SQLite",
            "error": str(ex),
            "connected": False
        }
