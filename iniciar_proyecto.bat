@echo off
title Sistema Predictivo de Diagnostico de Fallas en TI - JAVERY
chcp 65001 >nul
echo ==============================================================================
echo   SISTEMA PREDICTIVO DE DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS
echo   Caso de estudio: JAVERY - Quito, Ecuador ^| Titulación de Ingeniería
echo ==============================================================================
echo.

:: Paso 1: Configuración de Variables de Entorno
if not exist .env (
    echo [INFO] Creando archivo de configuración .env desde .env.example...
    copy .env.example .env >nul
)

:: Paso 2: Verificar entorno virtual de Python
if not exist "venv\Scripts\python.exe" (
    echo [INFO] Creando entorno virtual de Python (venv)...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual. Asegúrate de tener Python 3.10+ instalado.
        pause
        exit /b 1
    )
    echo [INFO] Instalando dependencias de Python (FastAPI, Scikit-Learn, PyTorch/Joblib)...
    .\venv\Scripts\pip.exe install -r backend\requirements.txt
)

:: Paso 3: Verificar dependencias de Node.js en el frontend
if not exist "frontend\node_modules" (
    echo [INFO] Instalando dependencias del Frontend (React 18, Lucide, Vite)...
    cd frontend
    call npm install
    cd ..
)

:: Paso 4: Iniciar Backend FastAPI
echo [INFO] Iniciando Backend API REST en http://127.0.0.1:8000 ...
start "Backend FastAPI (JAVERY)" cmd /k ".\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

:: Paso 5: Iniciar Frontend Vite
echo [INFO] Iniciando Servidor Web Frontend en http://localhost:5173 ...
start "Frontend React (JAVERY)" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================================
echo   ✓ ¡TODO LISTO! Ambos servicios se están ejecutando.
echo.
echo   * Frontend Web:   http://localhost:5173
echo   * Documentación:  http://127.0.0.1:8000/docs
echo   * Base de Datos:  Fallback local SQLite incluido (sin requerir docker)
echo ==============================================================================
echo.
echo Abriendo la aplicación en su navegador predeterminado...
timeout /t 4 >nul
start http://localhost:5173
exit
