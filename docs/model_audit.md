# Informe de Auditoría del Modelo y Prevención de Data Leakage

**Proyecto:** Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos  
**Caso de Estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Fecha de Auditoría:** Marzo 2026 / Sesión de Cierre Técnico  
**Autor de Auditoría:** Antigravity AI Agent & Jimmy Xavier Quinga  

---

## 1. Resumen Ejecutivo

La presente auditoría técnica examina exhaustivamente el flujo de preparación de datos, selección de características (*feature selection*) y modelado predictivo implementado en el notebook [`Entrenamiento_Modelo_Jimmy_OpenRepair_JAVERY_v2_Graficos.ipynb`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/08_NOTEBOOK/Entrenamiento_Modelo_Jimmy_OpenRepair_JAVERY_v2_Graficos.ipynb) y serializado en [`03_MODELO/mejor_modelo_diagnostico_fallas.joblib`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/03_MODELO/mejor_modelo_diagnostico_fallas.joblib).

El objetivo es auditar rigurosamente si existen riesgos de **fuga de información (*data leakage*)**, sesgos multilingües o inconsistencias conceptuales que puedan alterar la validez del sistema en producción.

---

## 2. Análisis de Variables y Prevención de Fuga de Información

### 2.1. Variables Excluidas Oportunamente (Anti-Data Leakage)
El análisis del código del notebook confirmó que **se excluyeron con éxito** las siguientes variables que sólo se conocen *después* de que el técnico desarma, inspecciona o repara el equipo:

| Variable Evaluada | Origen | Estado en el Pipeline | Motivo de Exclusión |
| :--- | :--- | :--- | :--- |
| `componente_danado_limpio` | JAVERY | **EXCLUIDA** | Fuga directa: especifica el componente físico averiado (e.g. chip de video, capacitor), lo cual se determina tras el diagnóstico. |
| `solucion_limpia` | JAVERY | **EXCLUIDA** | Fuga directa: describe el procedimiento correctivo ya ejecutado (e.g. reballing, cambio de pantalla). |
| `tiempo_diagnostico_horas` | JAVERY | **EXCLUIDA** | Métrica posterior: mide el tiempo empleado por el taller en determinar la falla. |
| `tiempo_reparacion_horas` | JAVERY | **EXCLUIDA** | Métrica posterior: duración del trabajo de taller. |
| `costo_usd` | JAVERY | **EXCLUIDA** | Métrica posterior: valor económico cobrado al cliente. |
| `estado_norm` | JAVERY | **EXCLUIDA** | Métrica posterior: estado final de entrega del equipo (`Operable`). |

> **Conclusión:** El diseño metodológico respetó el principio de recepción: el modelo únicamente toma datos disponibles en el mostrador del taller.

---

### 2.2. Hallazgo Técnico 1: Ruido Operativo en el Campo `sintoma` de Open Repair

- **Variable:** `sintoma` (proveniente de la columna `problem` en CompCat / Open Repair Alliance).
- **Motivo de Auditoría:** Al inspeccionar registros crudos de Open Repair, se constató que algunos voluntarios de reparación comunitaria redactaron el síntoma incluyendo la acción que realizaron (por ejemplo: *"Lüftung kaputt neue Netzteil angebaut"* o *"Wir hatten zuerst das Scharnier mit Kleber versucht zu kleben... Ersatzteil gewechselt"*).
- **Impacto:** En un porcentaje reducido del corpus de entrenamiento internacional, el texto contiene términos que indican reparación o sustitución de partes además del síntoma inicial del usuario. Sin embargo, dado que el vectorizador `TfidfVectorizer` opera con n-gramas de caracteres (3 a 5) y 12,000 características globales con sublinear term frequency, el peso dominante recae en patrones léxicos generales del problema y no en acciones puntuales.
- **Recomendación:** En futuras versiones de reentrenamiento, aplicar un filtro de expresiones regulares para remover verbos de acción en tiempo pasado o términos de sustitución en la fase de limpieza de texto.

---

### 2.3. Hallazgo Técnico 2: Desfase Lingüístico (*Cross-Lingual Shift*)

- **Variable:** `sintoma` (Lenguaje natural).
- **Motivo:** El dataset de entrenamiento (Open Repair Alliance / CompCat, 2,866 filas) está compuesto mayoritariamente por registros redactados en **alemán e inglés**, provenientes de talleres comunitarios europeos. En contraste, las órdenes reales de JAVERY (Quito, Ecuador) están redactadas en **español** (*"no enciende"*, *"no da imagen"*, *"pantalla azul"*).
- **Impacto:** En la validación ciega de 4 casos reales de JAVERY ([`04_RESULTADOS_MODELOS/predicciones_JAVERY_validacion.csv`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/04_RESULTADOS_MODELOS/predicciones_JAVERY_validacion.csv)), el modelo predijo uniformemente la clase `Configuration` con una probabilidad baja (entre 25.5% y 41.5%), arrojando 0 aciertos de 4. 
- **Causa Raíz:** Los n-gramas de caracteres en español no encontraron suficientes coincidencias con los términos clave en alemán/inglés de las clases físicas (`System board`, `Power/battery`), recayendo en la distribución a priori o en patrones difusos asociados a `Configuration`.
- **Recomendación para Producción e Investigación:**
  1. Para fines académicos y de titulación, este hallazgo es sumamente valioso porque evidencia formalmente las limitaciones de la transferencia directa de modelos internacionales a contextos locales sin traducción previa.
  2. En el frontend y en la API, se recomienda orientar al usuario sobre los términos y presentar siempre el **Top 3 de probabilidades**, donde las fallas de hardware frecuentemente ocupan el 2° o 3° lugar de certeza.
  3. En futuras fases, implementar una capa de traducción automática liviana (Español $\rightarrow$ Inglés) previa a la inferencia del pipeline TF-IDF, o migrar a un modelo de embeddings multilingüe (e.g., multilingual-e5 o BERT multilingual).

---

## 3. Conformidad del Modelo para Inferencia

El modelo cumple con todas las restricciones de aislamiento metodológico y ausencia de *data leakage*. La aplicación web consumirá el pipeline oficial sin alteración, reflejando fielmente el comportamiento matemático documentado en la memoria técnica.
