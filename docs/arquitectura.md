# Arquitectura del Sistema Predictivo de Diagnóstico de Fallas en TI

**Caso de Estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  

---

## 1. Visión General de la Arquitectura

El sistema implementa una arquitectura desacoplada por capas orientada a servicios (SOA) que permite a los técnicos de taller realizar diagnósticos predictivos en tiempo real a partir de los datos recolectados en la recepción del equipo, almacenando automáticamente cada inferencia en una base de datos central PostgreSQL para su monitoreo gerencial y auditoría a través de Microsoft Power BI.

```
┌─────────────────┐
│     USUARIO     │ (Técnico en mostrador de recepción de JAVERY)
└────────┬────────┘
         │ 1. Ingreso de orden (tipo, marca, antigüedad, síntoma)
         ▼
┌─────────────────┐
│  INTERFAZ WEB   │ React 18 + Vite (SPA)
│  (FRONTEND)     │ - Validación dinámica en cliente
└────────┬────────┘ - Visualización de certeza y Top 3
         │ 2. HTTP POST /api/predict (JSON)
         ▼
┌─────────────────┐
│  API / BACKEND  │ Python 3.11 + FastAPI (Asíncrono)
│  (UVICORN)      │ - Esquemas Pydantic v2
└────────┬────────┘ - Servicio singleton en memoria
         │ 3. Inferencia predictiva
         ▼
┌─────────────────┐
│ PIPELINE COLAB  │ Scikit-Learn Pipeline (`mejor_modelo_diagnostico_fallas.joblib`)
│ (ML INFERENCE)  │ - TF-IDF Vectorizer (char n-grams 3-5)
└────────┬────────┘ - One-Hot Encoder (90 marcas) + MinMax Scaler
         │          - Random Forest Classifier (200 árboles)
         │ 4. Clase predicha + Probabilidades Top 3
         ▼
┌─────────────────┐
│   POSTGRESQL    │ Base de Datos Central Operativa
│  (ALMACÉN BD)   │ - Tabla `predicciones`
└────────┬────────┘ - Vista optimizada `vw_powerbi_predicciones`
         │ 5. Conexión DirectQuery / Import
         ▼
┌─────────────────┐
│    POWER BI     │ Tablero Gerencial y Métricas de Calidad
│   (ANALYTICS)   │ - Indicadores de fallas, costos y certeza
└─────────────────┘
```

---

## 2. Descripción de Componentes

### 2.1. Capa de Presentación (Frontend Web)
- **Tecnología:** React 18, Vite 5, Lucide Icons, Vanilla CSS modular.
- **Responsabilidad:** Proporcionar una experiencia de usuario rápida, reactiva y clara sin recargas de página.
- **Módulos Principales:**
  1. *Nueva Predicción:* Formulario dinámico con dropdowns validados según el espacio de features aprendido en Google Colab, accesos rápidos para pruebas y tarjeta de diagnóstico con medidores de certeza visual.
  2. *Historial:* Explorador de diagnósticos en vivo desde PostgreSQL con búsqueda de texto completo, filtros por tipo de equipo y paginación.
  3. *Dashboard Power BI:* Lanzador directo del reporte analítico en nueva pestaña y visualización de indicadores clave en tiempo real.
  4. *Información del Modelo:* Panel académico con la matriz comparativa de los 6 algoritmos, métricas por clase y memoria técnica.

### 2.2. Capa de Servicios (Backend API)
- **Tecnología:** Python 3.11, FastAPI, Uvicorn, Pydantic v2.
- **Responsabilidad:** Exponer endpoints RESTful seguros, validar contratos de datos de entrada y salida, gestionar el ciclo de vida del modelo en memoria y asegurar la persistencia en base de datos.
- **Características de Seguridad:**
  - Inyección de dependencias para sesiones de base de datos.
  - Sanitización de entradas mediante Pydantic `@field_validator`.
  - Manejo global de excepciones que previene la fuga de stack traces en producción.
  - Configuración de CORS parametrizable mediante variables de entorno.

### 2.3. Capa de Inteligencia Artificial (ML Engine)
- **Tecnología:** Scikit-Learn 1.6.1, Joblib, Pandas, NumPy.
- **Artefacto:** `03_MODELO/mejor_modelo_diagnostico_fallas.joblib` (60.3 MB).
- **Responsabilidad:** Preprocesamiento de texto (TF-IDF a nivel de n-gramas de caracteres para mitigar errores léxicos), codificación de variables categóricas, escalado e imputación numérica, e inferencia multiclase en 19 categorías CompCat.

### 2.4. Capa de Persistencia (PostgreSQL)
- **Tecnología:** PostgreSQL 14+ / Azure Database for PostgreSQL Flexible Server.
- **Responsabilidad:** Almacenar de forma transaccional cada consulta efectuada por el técnico de recepción.
- **Estructura:**
  - Tabla `predicciones`: Llave primaria autoincremental, columnas individuales para dimensiones de análisis rápido, columnas `JSONB` para la distribución completa de probabilidades y variables crudas de entrada.
  - Vista `vw_powerbi_predicciones`: Preparación analítica con granularidad de fecha, rangos de antigüedad y etiquetas legibles.

### 2.5. Capa Analítica (Microsoft Power BI)
- **Tecnología:** Power BI Desktop / Power BI Service.
- **Responsabilidad:** Generar tableros de control de gestión gerencial y técnica sin necesidad de manipular manualmente archivos planos CSV.
- **Modos de Conexión:**
  - *DirectQuery:* Actualización instantánea en cuanto el técnico pulsa "PREDECIR FALLA" en la web.
  - *Import:* Actualización programada (e.g., cada hora o diaria) para alto rendimiento de consultas agregadas.
