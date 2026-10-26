# SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL

**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Estado del proyecto:** Sistema Web en Producción, Backend FastAPI, Pipeline ML Serializado, PostgreSQL y Conexión Directa a Power BI  

---

## 1. Objetivo General del Sistema

Desarrollar, evaluar e implementar un sistema informático integral para el **diagnóstico predictivo preliminar de fallas de hardware y software** en equipos informáticos (laptops y computadoras de escritorio). 

El sistema permite a un técnico en ventanilla ingresar los datos observables del equipo recibido, ejecutar en tiempo real un modelo de Machine Learning entrenado con 2,866 registros depurados de la taxonomía internacional CompCat / Open Repair, obtener la falla probable junto con el nivel de certeza y el Top 3 de probabilidades, almacenar automáticamente la consulta en **PostgreSQL**, y proveer alimentación analítica directa a **Microsoft Power BI** sin manipulación manual de archivos planos.

```
NUEVO EQUIPO EN RECEPCIÓN
           │
           ▼
     FORMULARIO WEB (React 18 + Vite)
           │
           ▼
    API REST (FastAPI + Pydantic v2)
           │
           ▼
 PIPELINE ML (Scikit-Learn Random Forest)
           │
           ▼
    FALLA DIAGNOSTICADA + CERTEZA TOP 3
           │
           ▼
 POSTGRESQL (Tabla 'predicciones' & Vista 'vw_powerbi_predicciones')
           │
           ▼
 MICROSOFT POWER BI (DirectQuery / Import)
```

---

## 2. Arquitectura de Carpetas del Proyecto

```
PROYECTO_JIMMY/
│
├── 01_DATOS_ORIGINALES/        # Archivos fuente brutos (JAVERY y Open Repair)
├── 02_DATOS_PROCESADOS/        # Datasets limpios para entrenamiento y validación
├── 03_MODELO/                  # Pipeline serializado oficial:
│   └── mejor_modelo_diagnostico_fallas.joblib (Random Forest, 60.3 MB)
├── 04_RESULTADOS_MODELOS/      # Métricas comparativas, classification report y curvas
├── 05_GRAFICOS/                # Gráficos exportados para la memoria técnica
├── 06_ORANGE/                  # Archivos y guía metodológica para Orange Data Mining
├── 07_POWER_BI/                # Plantillas, archivos CSV auxiliares y medidas DAX
├── 08_NOTEBOOK/                # Notebooks originales de Google Colab
├── 09_DOCUMENTACION/           # Memoria metodológica e interpretación de gráficos
│
├── backend/                    # API Backend REST en FastAPI
│   ├── app/
│   │   ├── main.py             # Aplicación FastAPI, lifespan, CORS y logging
│   │   ├── api/                # Endpoints (/health, /predict, /predictions, etc.)
│   │   ├── config/             # Configuración y variables de entorno Pydantic
│   │   ├── database/           # Conexión SQLAlchemy, pooling y fallback SQLite
│   │   ├── models/             # Modelo ORM de la tabla 'predicciones'
│   │   ├── schemas/            # Esquemas de validación Pydantic v2
│   │   └── services/           # Inferencia ML y lógica de persistencia
│   ├── ml/                     # Metadatos del modelo (metadata.json y README_MODEL.md)
│   ├── tests/                  # Suite de pruebas automatizadas (test_prediction.py)
│   ├── requirements.txt        # Dependencias de Python
│   └── Dockerfile              # Contenedor optimizado para Azure App Service
│
├── frontend/                   # Interfaz Web de Usuario (SPA)
│   ├── src/
│   │   ├── components/         # Navbar, PredictionForm, ResultCard, HistoryTable, etc.
│   │   ├── App.jsx             # Enrutamiento de pestañas y estado global
│   │   ├── index.css           # Sistema de diseño Slate Tech & Glassmorphism
│   │   └── main.jsx            # Punto de entrada React 18
│   ├── package.json            # Dependencias de Node.js
│   ├── vite.config.js          # Configuración de compilador y proxy
│   ├── nginx.conf              # Configuración de servidor web para producción
│   └── Dockerfile              # Contenedor multi-stage Nginx para producción
│
├── database/                   # Scripts de Base de Datos y Analítica
│   ├── schema.sql              # DDL de PostgreSQL (tabla predicciones e índices)
│   ├── views_powerbi.sql       # Vista 'vw_powerbi_predicciones' para Power BI
│   └── queries_powerbi.sql     # 7 consultas analíticas de agregación
│
├── docs/                       # Documentación Técnica Exhaustiva
│   ├── arquitectura.md         # Diseño arquitectónico desacoplado
│   ├── modelo.md               # Especificación matemática del modelo ML
│   ├── model_audit.md          # Auditoría de variables, leakage y cross-lingual shift
│   ├── powerbi.md              # Guía de conexión Power BI a PostgreSQL
│   └── azure_deployment.md     # Guía de despliegue en Microsoft Azure Cloud
│
├── .env.example                # Plantilla de variables de entorno
├── docker-compose.yml          # Orquestación local de PostgreSQL, Backend y Frontend
└── README.md                   # Este documento maestro
```

---

## 3. Especificación del Modelo de Machine Learning

- **Artefacto:** [`03_MODELO/mejor_modelo_diagnostico_fallas.joblib`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/03_MODELO/mejor_modelo_diagnostico_fallas.joblib).
- **Algoritmo:** `RandomForestClassifier(n_estimators=200, class_weight='balanced_subsample', random_state=42)`.
- **Estructura:** Scikit-Learn `Pipeline` integral (preprocesador + modelo).
- **Características de Entrada (4 features):**
  1. `tipo_equipo` (laptop, desktop).
  2. `marca` (90 marcas aprendidas, con manejo de nuevas marcas vía `handle_unknown='ignore'`).
  3. `antiguedad_anios` (numérico en años; imputación automática por mediana de 6.0 años + MinMax Scaler).
  4. `sintoma` (texto libre vectorizado por `TfidfVectorizer` con n-gramas de caracteres 3 a 5).
- **Variable Objetivo:** `tipo_falla` (19 categorías diagnósticas de la taxonomía CompCat).
- **Métricas Oficiales:**
  * **Test Accuracy:** 71.60% (0.7160).
  * **CV F1 Macro:** 0.6195 (criterio rector multialgorítmico).
  * **Test F1 Macro:** 0.6164.
  * **Test ROC-AUC Macro OVR:** 0.9269.
  * **Test Precision Macro:** 0.6463.
  * **Test Recall Macro:** 0.6055.
- **Prevención de Data Leakage:** Se prohibió estrictamente el uso de variables posteriores al diagnóstico (`componente_danado`, `solucion`, `tiempo_diagnostico`, `costo_usd`, `estado_final`). Consulte la auditoría completa en [`docs/model_audit.md`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/docs/model_audit.md).

---

## 4. Requisitos Previos

- **Python:** Versión 3.10, 3.11 o 3.12 (verificado en Python 3.11.3).
- **Node.js:** Versión 18+ o 20+ (verificado en Node.js v24.12.0 con npm 11.6.2).
- **Base de Datos:** PostgreSQL 14+ (local o en contenedor Docker).
- **Docker:** Opcional para orquestación unificada mediante Docker Compose.

---

## 5. Instrucciones de Instalación y Ejecución Local

### Paso 1: Configurar el Entorno Virtual de Python
```bash
# 1. Crear el entorno virtual en la raíz
python -m venv venv

# 2. Activar el entorno virtual
# En Windows PowerShell:
.\venv\Scripts\Activate.ps1
# En Linux/macOS:
source venv/bin/activate

# 3. Instalar las dependencias del backend
pip install -r backend/requirements.txt
```

### Paso 2: Configurar las Variables de Entorno
Copiar el archivo de plantilla y ajustar credenciales:
```bash
copy .env.example .env
```
*(Por defecto, si no tiene una base PostgreSQL activa en su máquina, el backend activará automáticamente un almacenamiento local seguro en SQLite para permitir pruebas y desarrollo sin bloqueos).*

### Paso 3: Iniciar el Backend FastAPI
```bash
# Estando en la raíz del proyecto con el entorno virtual activo:
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Documentación interactiva Swagger UI: **`http://localhost:8000/docs`**
- Documentación ReDoc: **`http://localhost:8000/redoc`**
- Verificación de salud del sistema: **`http://localhost:8000/api/health`**

### Paso 4: Iniciar el Frontend Web
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
- Abrir en el navegador: **`http://localhost:5173`**

---

## 6. Ejecución Rápida con Docker Compose

Si dispone de Docker y desea levantar la solución completa con un solo comando (PostgreSQL 16 + FastAPI + React Nginx):
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432` (Base de datos: `diagnostico_ti`, Usuario: `postgres`, Contraseña: `postgrespassword`)

---

## 7. Catálogo de Endpoints de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio, modelo cargado y conexión a base de datos. |
| `GET` | `/api/model/info` | Especificación técnica, clases y tabla comparativa de los 6 modelos. |
| `GET` | `/api/model/features` | Tipos de equipo válidos, marcas aprendidas y casos de prueba. |
| `POST` | `/api/predict` | Ejecuta inferencia del modelo, calcula certeza y guarda en PostgreSQL. |
| `GET` | `/api/predictions` | Historial paginado de diagnósticos con búsqueda y filtros. |
| `GET` | `/api/predictions/{id}` | Detalle completo de una predicción por ID. |
| `GET` | `/api/dashboard/stats` | Estadísticas agregadas (totales, fallas frecuentes, distribución). |
| `GET` | `/api/powerbi/config` | Enlace y configuración del reporte de Power BI. |

---

## 8. Integración con Microsoft Power BI

El sistema elimina la necesidad de exportar e importar archivos CSV manualmente tras cada consulta.

1. Abrir **Power BI Desktop**.
2. Seleccionar **Obtener datos** $\rightarrow$ **Base de datos PostgreSQL**.
3. Servidor: `localhost:5432` (o el host en Azure) | Base de datos: `diagnostico_ti`.
4. Modo de conectividad: **DirectQuery** (para actualización en tiempo real) o **Importar**.
5. Seleccionar la vista analítica oficial: **`vw_powerbi_predicciones`**.
6. Consulte la guía paso a paso y el catálogo de medidas DAX en [`docs/powerbi.md`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/docs/powerbi.md).

---

## 9. Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integración que validan la carga del modelo, la inferencia para laptops y desktops, el cálculo de probabilidades Top 3, la imputación de variables faltantes, los endpoints REST y la persistencia en base de datos:

```bash
# Ejecutar la suite de pruebas automatizadas:
.\venv\Scripts\pytest.exe backend/tests/test_prediction.py -v
```
*(Resultado: **10 pruebas superadas con 100% de éxito**).*

---

## 10. Despliegue en Microsoft Azure

El sistema está preparado para su pase a producción en la nube de Microsoft Azure:
- **Base de Datos:** Azure Database for PostgreSQL Flexible Server.
- **Backend:** Azure App Service para Contenedores Linux (vía [`backend/Dockerfile`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/backend/Dockerfile)).
- **Frontend:** Azure Static Web Apps o Azure App Service.
- **Power BI:** Conectado directamente a Azure PostgreSQL con cifrado SSL.

Consulte los comandos exactos de Azure CLI en [`docs/azure_deployment.md`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/docs/azure_deployment.md).
