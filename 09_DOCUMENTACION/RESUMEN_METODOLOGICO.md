# RESUMEN METODOLÓGICO DEL ENTRENAMIENTO Y EVALUACIÓN

**Proyecto:** SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL  
**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Sección:** 09_DOCUMENTACION  

---

## Introducción y Contexto General

El presente documento expone de manera estructurada y rigurosa los fundamentos metodológicos, el diseño experimental y los criterios de ingeniería de datos adoptados para la construcción del sistema predictivo de diagnóstico de fallas en equipos informáticos (laptops y computadoras de escritorio).

---

## 1. Limitación Inicial de Registros en el Caso de Estudio JAVERY

La empresa **JAVERY, Ingeniería Humana y Tecnológica**, ubicada en la ciudad de Quito, Ecuador, facilitó su repositorio histórico de soporte y servicio técnico. Durante la etapa de diagnóstico y auditoría inicial de los datos, se constató que la institución contaba con un volumen reducido de órdenes de servicio completamente documentadas con todas las variables técnicas y operativas requeridas ($N = 6$ casos con trazabilidad íntegra). 

Entre estos registros, además, dos correspondían a líneas de dispositivos distintas a computadoras personales (un teléfono celular y una impresora multifuncional), dejando únicamente 4 órdenes correspondientes a computadoras (dos laptops y dos computadoras de escritorio).

---

## 2. Inviabilidad Metodológica de Entrenar Exclusivamente con JAVERY

Desde la perspectiva del aprendizaje automático supervisado, un conjunto de datos de tan baja dimensionalidad muestral ($N = 4$ casos computacionales) imposibilita el entrenamiento directo de modelos predictivos generalizables:
- Se generaría un sobreajuste severo o memorización trivial.
- No existirían ejemplos suficientes para representar la distribución probabilística de las distintas fallas del hardware y software.
- Resultaría estadísticamente inválido aplicar esquemas de particionamiento estratificado (train/test) o validación cruzada ($k$-fold).

Por tanto, entrenar un modelo exclusivamente con dichos casos habría constituido una mala práctica metodológica inaceptable en un proyecto de titulación de ingeniería.

---

## 3. Incorporación del Corpus Internacional Open Repair Alliance / CompCat

Para dotar al sistema predictivo de un sustrato de entrenamiento robusto, estadísticamente representativo y respaldado por estándares globales, se incorporó el conjunto de datos público internacional de la **Open Repair Alliance (CompCat - Computer Categorisation)**.

CompCat es una iniciativa internacional que recopila miles de registros de reparación comunitaria y técnica en todo el mundo. Para este proyecto, se extrajeron y consolidaron específicamente los registros pertenecientes a las dos categorías de cómputo estándar:
- **Laptops** (`compcat_laptops.csv`)
- **Computadoras de escritorio** (`compcat_desktops.csv`)

Tras la limpieza de duplicados y registros inconsistentes, se consolidó un corpus de entrenamiento experimental de **2,866 registros**.

---

## 4. Separación Estricta de Entornos de Datos (Entorno A vs. Entorno B)

El proyecto adoptó una arquitectura de datos rigurosamente aislada en dos entornos complementarios pero metodológicamente independientes:

| Entorno | Denominación | Fuente de Datos | Volumen | Finalidad en el Proyecto |
| :---: | :---: | :---: | :---: | :--- |
| **Entorno A** | JAVERY Real | JAVERY, Ingeniería Humana y Tecnológica | 6 órdenes | Diagnóstico operativo local, indicadores de gestión técnica, análisis descriptivo en Power BI y validación operativa exploratoria. |
| **Entorno B** | Open Repair / CompCat | Open Repair Alliance (Internacional) | 2,866 registros | Entrenamiento experimental, ajuste de hiperparámetros, validación cruzada y evaluación comparativa multialgorítmica. |

---

## 5. Trazabilidad de Fuentes y Prohibición de Fusión Engañosa

En cumplimiento estricto con la ética académica y los estándares de ingeniería de datos:
- **Los registros de Open Repair jamás se etiquetaron ni presentaron como casos de clientes de JAVERY.**
- En cada tabla del repositorio se conserva el campo de metadatos `fuente` (`"JAVERY"` o `"OPEN_REPAIR_COMPCAT"`).
- Los tableros de control de Power BI mantienen páginas diferenciadas para no mezclar la realidad operativa de la empresa ecuatoriana con las estadísticas globales del corpus internacional.

---

## 6. Definición de Variables Predictoras (Recepción del Equipo)

Para garantizar la aplicabilidad del sistema en el flujo de trabajo real de un taller técnico, las variables predictoras se restringieron **únicamente a la información disponible al momento de recibir el equipo en ventanilla**, antes de que cualquier técnico abra o inspeccione el hardware:

$$\text{Equipo Recibido: } \{\text{tipo\_equipo}, \text{marca}, \text{antigüedad}, \text{síntoma reportado}\} \xrightarrow{\text{Modelo}} \text{Diagnóstico Probable}$$

1. **`tipo_equipo`** *(Categórica)*: Tipo de máquina (`laptop` o `desktop`).
2. **`marca`** *(Categórica)*: Fabricante del equipo (HP, Lenovo, Dell, Asus, Sin marca, etc.).
3. **`antiguedad_anios`** *(Numérica continua/entera)*: Años transcurridos desde la fabricación del equipo hasta su ingreso.
4. **`sintoma`** *(Texto libre / Procesamiento de Lenguaje Natural)*: Problema manifestado por el usuario (ej. *"no enciende"*, *"pantalla azul al iniciar"*, *"se recalienta y apaga"*).

---

## 7. Variable Objetivo (Target) y Taxonomía Homologada

La variable a predecir es:
- **`tipo_falla`**: Categoría diagnóstica de la falla informática.

Para estandarizar el espacio de salida y posibilitar la compatibilidad entre el taller local y los estándares internacionales, se adoptó la **Taxonomía CompCat**, que define categorías mutuamente excluyentes entre las que destacan:
- *Fallas de Hardware:* `System board` (placa madre), `Power/battery` (alimentación/batería), `Integrated screen` (pantalla), `Integrated keyboard` (teclado), `Internal storage` (disco duro / SSD), `Ports/slots/connectors`, `Overheating` (recalentamiento), `Case/chassis`.
- *Fallas de Software / Sistema:* `Boot` (arranque del sistema), `Operating system` (sistema operativo dañado), `Configuration` (controladores, BIOS, ajustes), `Virus/malware`, `Performance` (lentitud/rendimiento).
- *Categorías residuales:* `Other`, `Multiple`, `Internal damage`.

En el conjunto de entrenamiento final existen **19 clases diagnósticas** activas.

---

## 8. Prevención Estricta de Fuga de Información (Anti-Data Leakage)

Uno de los mayores riesgos en minería de datos aplicada al diagnóstico técnico es la fuga de información (*data leakage*), que ocurre cuando se introducen en el modelo variables que cronológicamente solo se conocen **después** de haber realizado el diagnóstico o la reparación.

En este proyecto se excluyeron categóricamente como predictores las siguientes variables:
- **Componente dañado confirmado** (`componente_danado_limpio`): Conocer que la "bobina de poder" está quemada delata de inmediato que la falla es de placa madre.
- **Solución aplicada** (`solucion_limpia`): Saber que se hizo "reinstalación de Windows" delata que la falla era de sistema operativo o arranque.
- **Tiempo de diagnóstico** (`tiempo_diagnostico_horas`): Variable de resultado posfacto.
- **Tiempo de reparación** (`tiempo_reparacion_std`): Variable de resultado posfacto.
- **Costo de la reparación** (`costo_usd`): Establecido tras la cotización de repuestos y mano de obra.
- **Estado final del equipo** (`estado_norm`): Registrado al momento de la entrega al cliente.

El uso de cualquiera de estas variables habría inflado artificialmente las métricas de exactitud, produciendo un modelo inservible para la recepción de nuevos equipos.

---

## 9. Evaluación Comparativa Multialgorítmica

Se implementó una arquitectura de procesamiento homogénea mediante un `Pipeline` de Scikit-Learn compuesto por:
- `ColumnTransformer`:
  * `TfidfVectorizer`: Sublineal, tokenización de n-gramas de caracteres de 3 a 5 (`analyzer='char_wb'`), $12,000$ características máximas para capturar raíces léxicas multilingües y errores tipográficos en el síntoma.
  * `OneHotEncoder`: Para `tipo_equipo` y `marca` con manejo de categorías no vistas (`handle_unknown='ignore'`).
  * `SimpleImputer` + `StandardScaler`: Imputación por mediana y estandarización para `antiguedad_anios`.

Se evaluaron bajo idénticas condiciones seis familias de algoritmos de clasificación:
1. **Árbol de Decisión (`DecisionTreeClassifier`)**: Modelo de reglas jerárquicas balanceado.
2. **Random Forest (`RandomForestClassifier`)**: Ensamble de 200 árboles de decisión con remuestreo estratificado (`class_weight='balanced_subsample'`).
3. **Naive Bayes (`MultinomialNB`)**: Clasificador probabilístico bayesiano.
4. **Regresión Logística (`LogisticRegression`)**: Modelo lineal multinomial regularizado (L2).
5. **Support Vector Machine (`LinearSVC` calibrado)**: Máquina de soporte vectorial lineal para espacios dispersos de alta dimensionalidad.
6. **K-Nearest Neighbors (`KNeighborsClassifier`)**: Clasificador basado en distancia geométrica de vecinos cercanos.

---

## 10. Criterio de Selección: F1 Macro en Validación Cruzada

Dado que la distribución de fallas informáticas en la vida real es altamente desbalanceada (algunas clases como *Performance* o *Power/battery* agrupan cientos de casos, mientras que fallas en *Multiple* o *Other* cuentan con menos de 10 ejemplos), la métrica tradicional de **Accuracy (Exactitud)** resulta engañosa, ya que premia a los modelos que favorecen a las clases mayoritarias e ignoran las fallas críticas minoritarias.

Por esta razón, se estableció como **criterio técnico rector de selección el F1 Macro en Validación Cruzada Estratificada ($k = 3$)**:

$$\text{F1 Macro} = \frac{1}{C} \sum_{i=1}^{C} \text{F1}_i$$

El F1 macro calcula la media armónica entre precisión y exhaustividad para cada una de las 19 clases y luego promedia aritméticamente dichos resultados, otorgando idéntico peso a cada tipo de falla sin importar su frecuencia.

**Resultados obtenidos en Validación Cruzada:**
- **1° Random Forest:** $\text{CV F1 Macro} = \mathbf{0.6195}$ (Ganador oficial)
- **2° Support Vector Machine:** $\text{CV F1 Macro} = 0.5760$
- **3° Regresión Logística:** $\text{CV F1 Macro} = 0.5626$
- **4° Árbol de Decisión:** $\text{CV F1 Macro} = 0.5079$
- **5° K-Nearest Neighbors:** $\text{CV F1 Macro} = 0.3878$
- **6° Naive Bayes:** $\text{CV F1 Macro} = 0.3181$

---

## 11. Evaluación Rigurosa en Conjunto de Prueba Independiente (Hold-out Test Set)

Para validar la capacidad de generalización y evitar sesgos optimistas, se reservó un **20% del corpus (574 registros)** como conjunto de prueba ciego, estratificado por tipo de falla.

En este conjunto de prueba, **Random Forest** ratificó su liderazgo:
- **Test Accuracy:** $\mathbf{0.7160}$ ($71.60\%$ de exactitud global).
- **Test Precision Macro:** $\mathbf{0.6463}$ ($64.63\%$).
- **Test Recall Macro:** $\mathbf{0.6055}$ ($60.55\%$).
- **Test F1 Macro:** $\mathbf{0.6164}$ ($61.64\%$).
- **Test F1 Weighted:** $\mathbf{0.7113}$ ($71.13\%$).
- **Test ROC-AUC Macro OVR:** $\mathbf{0.9269}$ ($92.69\%$, excelente capacidad discriminante multiclase).

---

## 12. Validación Operativa Exploratoria en Casos Reales JAVERY

Como cierre metodológico de la investigación, el modelo ganador entrenado (`mejor_modelo_diagnostico_fallas.joblib`) fue sometido a una **prueba ciega sobre los 4 casos computacionales reales de JAVERY** (`OS-003`, `OS-004`, `OS-005`, `OS-006`), los cuales permanecieron estrictamente aislados y jamás formaron parte del entrenamiento.

**Resultados y Hallazgo Académico Fundamental:**
- El modelo predijo la clase `Configuration` en los 4 casos evaluados, obteniendo $0/4$ aciertos ($0.00\%$ de exactitud exploratoria).
- Sin embargo, las probabilidades máximas estimadas por el modelo fueron bajas ($0.255$ a $0.415$), lo que evidencia que el modelo **no clasificó con una falsa certeza elevada**, sino que actuó en un régimen de alta incertidumbre.
- **Causa Raíz Diagnosticada:** **Disparidad de Dominio Lingüístico (Cross-Lingual Domain Shift)**. Mientras que Open Repair / CompCat contiene registros formulados primordialmente en inglés y alemán (ej. *"overheating, goes not on"*, *"USB-Treiber fehlen"*), los registros de JAVERY contienen síntomas redactados en español (ej. *"no enciende"*, *"no da imagen"*, *"logo detenido"*). Al procesar n-gramas de caracteres de palabras españolas que no tenían alta frecuencia léxica en el corpus de origen, la red de árboles ponderó la clase mayoritaria con representaciones morfológicas más neutras (`Configuration`).
- **Valor Académico:** Esta validación demuestra de manera empírica e irrefutable la importancia de la adaptación al dominio local y sienta las bases técnicas para el trabajo futuro: implementar traducción automática previa o entrenar representaciones semánticas multilingües (como embeddings preentrenados).

---
*Documento aprobado y archivado en `09_DOCUMENTACION/RESUMEN_METODOLOGICO.md`.*
