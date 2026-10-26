# GUÍA METODOLÓGICA DE RÉPLICA EN ORANGE DATA MINING

**Proyecto:** SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL  
**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Sección:** 06_ORANGE  

---

## 1. Propósito Metodológico y Advertencia Técnica Fundamental

> [!IMPORTANT]
> **Diferenciación Metodológica Obligatoria:**
> 1. **Resultados Oficiales del Proyecto:** Corresponden exclusivamente al entrenamiento ejecutado en Python con Scikit-Learn y conservados en `03_MODELO/mejor_modelo_diagnostico_fallas.joblib` y `04_RESULTADOS_MODELOS/resultados_modelos.csv`.
> 2. **Flujo Propuesto / Replicable en Orange:** Constituye una **réplica metodológica y evidencia visual complementaria** para la memoria técnica y defensa de grado. No se debe afirmar que Orange produjo métricas idénticas decimal a decimal a las del notebook de Python, debido a diferencias internas en las implementaciones de los algoritmos, tokenizadores de texto y semillas de particionamiento.

El propósito de esta guía es permitir al tribunal evaluador, tutores o investigadores reproducir visualmente la comparación multialgorítmica empleando la herramienta interactiva **Orange Data Mining (versión 3.35 o superior)**.

---

## 2. Requisitos Previos e Instalación de Complementos

1. **Software Base:** Tener instalado Orange Canvas (se puede descargar desde [https://orangedatamining.com](https://orangedatamining.com)).
2. **Complemento de Minería de Texto (Orange Text):**
   - El síntoma del equipo (`sintoma`) es una variable textual no estructurada.
   - En Python se utilizó un vectorizador `TfidfVectorizer` con n-gramas de caracteres (3 a 5).
   - Para que Orange procese texto, es **indispensable** instalar el add-on oficial **Text**:
     * En el menú superior de Orange, ir a: `Options` $\rightarrow$ `Add-ons...`.
     * Buscar **Orange3-Text** y marcar la casilla de verificación.
     * Hacer clic en `OK` y reiniciar Orange Data Mining.
   - *Nota de contingencia:* Si no se dispone de conexión a Internet o permisos de administrador para instalar add-ons, en la Sección 5 se detalla el flujo alternativo sin minería de texto (modo tabular básico).

---

## 3. Dataset para Orange

El archivo oficial preparado para este entorno se ubica en:
`06_ORANGE/dataset_orange_final.csv`

Posee 2,866 instancias y 5 columnas estrictamente filtradas para evitar fuga de información:
- **`tipo_falla`** (Variable Objetivo / Target): 19 clases diagnósticas.
- **`tipo_equipo`** (Predictor Categórico): laptop, desktop.
- **`marca`** (Predictor Categórico): marcas estandarizadas (HP, Lenovo, Dell, Asus, Sin marca, etc.).
- **`antiguedad_anios`** (Predictor Numérico): antigüedad del equipo en años.
- **`sintoma`** (Predictor Textual): descripción del problema reportado al momento de recepción.

*No contiene identificadores (`id_ords`), nombres de clientes ni variables posteriores al diagnóstico (como solución, componente reparado o costo).*

---

## 4. Diagrama y Flujo de Trabajo Paso a Paso en Orange

### Diagrama del Flujo Conceptual
```
                       ┌────────────────┐
                       │  File (CSV)    │
                       └───────┬────────┘
                               │
                       ┌───────▼────────┐
                       │ Select Columns │
                       └───────┬────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
    [Flujo con Text Add-on]         [Flujo Tabular Estándar]
    ┌─────────────────────────┐     ┌────────────────────────┐
    │ Corpus / Preprocess Text│     │      Preprocess        │
    │ (TF-IDF / N-gramas)     │     │ (Impute / Discretize)  │
    └───────────┬─────────────┘     └───────────┬────────────┘
                │                               │
                └──────────────┬────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
  ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
  │  Tree       │       │Random Forest│       │ Naive Bayes │
  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
         │                     │                     │
  ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
  │Logistic Reg.│       │     SVM     │       │     KNN     │
  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                       ┌───────▼────────┐
                       │  Test & Score  │
                       │ (3-Fold Strat) │
                       └───────┬────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
       ┌───────▼────────┐              ┌───────▼────────┐
       │Confusion Matrix│              │  ROC Analysis  │
       └────────────────┘              └────────────────┘
```

---

### Paso 1: Carga del Dataset (`File`)
1. Arrastra el widget **File** al lienzo.
2. Haz doble clic y selecciona la ruta: `06_ORANGE/dataset_orange_final.csv`.
3. Orange detectará automáticamente las columnas. Verifica la tabla de tipos:
   - `tipo_equipo`: Categorical / Feature
   - `marca`: Categorical / Feature
   - `antiguedad_anios`: Numeric / Feature
   - `sintoma`: String (o Text si Text Add-on está activo) / Feature
   - `tipo_falla`: Categorical / **Target**
4. Haz clic en **Apply**.

---

### Paso 2: Selección de Columnas (`Select Columns`)
1. Conecta **File** al widget **Select Columns**.
2. Configura los roles explícitos:
   - **Target Variable:** `tipo_falla`.
   - **Features:** `tipo_equipo`, `marca`, `antiguedad_anios`, `sintoma`.
   - **Metas / Ignored:** Vacío (no dejar variables sobrantes).
3. Cierra la ventana.

---

### Paso 3: Preprocesamiento de Datos (`Preprocess` y `Orange Text`)

#### Opción A: Con Orange3-Text (Recomendado para máxima fidelidad)
1. Conecta **Select Columns** al widget **Corpus**.
2. Conecta **Corpus** al widget **Preprocess Text**.
   - En **Transformation**: Activar *Lowercase*.
   - En **Tokenization**: Seleccionar *Regexp* o *Word* (o subpalabras si está disponible).
   - En **Filtering**: Activar Stopwords (inglés y alemán, ya que Open Repair contiene descripciones multilingües).
   - En **Document-Term Matrix**: Seleccionar **TF-IDF**.
3. La salida de este widget entregará la matriz vectorial combinada con las variables categóricas y numéricas.

#### Opción B: Sin Orange3-Text (Tratamiento tabular base)
1. Conecta **Select Columns** al widget **Preprocess**.
2. En **Missing Values**: Configurar *Impute Missing Values* $\rightarrow$ *Average/Most frequent* (para imputar antigüedad en los casos faltantes, tal como se hizo en Python con SimpleImputer).
3. En **Categorical**: *One-hot encoding* (tratamiento estándar para variables categóricas).
4. *Nota:* En esta opción, el campo `sintoma` quedará como meta-atributo y los modelos aprenderán primordialmente de `tipo_equipo`, `marca` y `antiguedad_anios`.

---

### Paso 4: Conexión de los 6 Algoritmos Candidatos
Arrastra desde la sección **Model** los siguientes 6 widgets y conéctalos a la salida del preprocesamiento:

1. **Decision Tree (`Tree`):**
   - *Induce binary tree:* Desmarcado.
   - *Min. number of instances in leaves:* 2 (equivalente a `min_samples_leaf=2`).
2. **Random Forest (`Random Forest`):**
   - *Number of trees:* 200 (equivalente a `n_estimators=200`).
   - *Growth control:* Replicate training set (bootstrap).
3. **Naive Bayes (`Naive Bayes`):**
   - Configuración bayesiana por defecto.
4. **Logistic Regression (`Logistic Regression`):**
   - *Regularization:* Ridge (L2), Cost C = 1.0.
5. **Support Vector Machine (`SVM`):**
   - *Cost (C):* 1.0.
   - *Kernel:* RBF o Lineal.
6. **k-Nearest Neighbors (`kNN`):**
   - *Number of neighbors:* 5.
   - *Metric:* Euclidean.

---

### Paso 5: Evaluación y Comparación (`Test & Score`)
1. Arrastra el widget **Test & Score** (sección *Evaluate*).
2. Conecta los datos preprocesados a **Test & Score** (puerto *Data*).
3. Conecta cada uno de los 6 modelos a **Test & Score**.
4. Abre **Test & Score** y configura la técnica de validación:
   - **Sampling type:** **Cross validation**.
   - **Number of folds:** **3** (estratificado), idéntico al protocolo de validación cruzada 3-fold usado en el notebook.
5. Observa la tabla de métricas generada:
   - **AUC** (Área bajo la curva ROC).
   - **CA** (Classification Accuracy).
   - **F1** (F1-score).
   - **Precision**.
   - **Recall**.

> [!NOTE]
> En la tabla de `Test & Score`, selecciona el ordenamiento por **F1** para verificar cómo **Random Forest** lidera el ranking, manteniendo la coherencia metodológica con el estudio oficial.

---

### Paso 6: Inspección de Evidencias (`Confusion Matrix` y `ROC Analysis`)
1. Conecta **Test & Score** al widget **Confusion Matrix**.
   - Permite visualizar las predicciones correctas en la diagonal principal y los errores en las celdas fuera de ella.
   - Se puede alternar entre recuentos absolutos (*Number of instances*) y porcentajes (*Proportions*).
2. Conecta **Test & Score** al widget **ROC Analysis**.
   - Permite seleccionar cada una de las clases de `tipo_falla` para observar la curva ROC y el valor AUC específico por clase.

---

### Paso 7: Validación Operativa con Casos JAVERY (`Predictions`)
1. Arrastra un segundo widget **File** y carga `06_ORANGE/dataset_orange_javery_val.csv`.
2. Arrastra el widget **Predictions** (sección *Evaluate*).
3. Conecta el modelo **Random Forest** al puerto *Predictors* de **Predictions**.
4. Conecta el widget **File** de validación al puerto *Data* de **Predictions**.
5. Abre **Predictions**: se observará cómo el modelo clasifica los 4 casos reales y las probabilidades asignadas a cada categoría.

---

## 5. Resumen Comparativo para la Memoria Técnica

Al redactar el capítulo de experimentación o defensa, utiliza este cuadro explicativo:

| Aspecto Metodológico | Implementación Oficial en Python | Réplica Interactiva en Orange |
| :--- | :--- | :--- |
| **Entorno de ejecución** | Scikit-Learn 1.x / Pipeline Python | Orange Data Mining Canvas 3.x |
| **Tratamiento de texto** | TF-IDF char n-grams (3 a 5), sublinear TF | Add-on Orange3-Text (TF-IDF / N-grams) |
| **Preprocesamiento** | ColumnTransformer (OneHot + SimpleImputer) | Widgets Preprocess / Preprocess Text |
| **Validación cruzada** | 3-Fold Stratified K-Fold | Test & Score (3 Folds Cross Validation) |
| **Métrica de selección** | F1 Macro CV (0.6195) | F1 / CA en Test & Score |
| **Modelo ganador** | **Random Forest** | **Random Forest** |
| **Uso en titulación** | Fuente oficial de métricas y modelo final `.joblib` | Evidencia visual interactiva y capturas de pantalla |

---
*Archivo generado para el repositorio oficial del proyecto de titulación JAVERY.*
