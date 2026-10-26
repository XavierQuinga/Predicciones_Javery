# Especificación Técnica del Modelo de Machine Learning

**Proyecto:** Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos  
**Caso de Estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Entorno de Entrenamiento:** Google Colab (Notebook `08_NOTEBOOK/Entrenamiento_Modelo_Jimmy_OpenRepair_JAVERY_v2_Graficos.ipynb`)  
**Pipeline Serializado:** `03_MODELO/mejor_modelo_diagnostico_fallas.joblib`  

---

## 1. Definición del Problema Predictivo

El modelo resuelve una tarea de **clasificación multiclase supervisada**, prediciendo la causa raíz o módulo averiado de un equipo informático a partir de los datos observables durante la recepción en el taller:

$$\text{Entradas} = \{\text{tipo\_equipo}, \text{marca}, \text{antiguedad\_anios}, \text{sintoma}\} \longrightarrow \text{tipo\_falla} \in \{1, 2, \dots, 19\}$$

---

## 2. Características de Entrada (Features)

| Variable | Tipo | Transformación en Pipeline | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| `tipo_equipo` | Categórica (`laptop`, `desktop`) | `OneHotEncoder(handle_unknown='ignore')` | Diferencia las arquitecturas físicas (chasis móvil vs. torre). |
| `marca` | Categórica (90 categorías) | `OneHotEncoder(handle_unknown='ignore')` | Captura patrones de falla característicos por fabricante (e.g. bisagras en ciertas marcas, chips en otras). |
| `antiguedad_anios` | Numérica (float) | `SimpleImputer(strategy='median')` [6.0 años] + `MinMaxScaler()` | Modela la probabilidad de falla por degradación de hardware y desgaste térmico. |
| `sintoma` | Texto libre | `TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5), min_df=2, max_features=12000, sublinear_tf=True)` | N-gramas de caracteres dentro de límites de palabra; tolera errores tipográficos y variaciones de redacción multilingüe. |

---

## 3. Clases Diagnósticas (19 Clases CompCat)

1. `Boot` (Fallas en la secuencia de arranque o BIOS)
2. `Case/chassis` (Roturas de bisagras, carcasas o tapas)
3. `Configuration` (Ajustes de software, BIOS o controladores)
4. `Integrated keyboard` (Teclado integrado defectuoso)
5. `Integrated media component` (Cámara web, micrófonos, parlantes)
6. `Integrated optical drive` (Lector de CD/DVD)
7. `Integrated pointing device` (Touchpad / trackpoint)
8. `Integrated screen` (Panel LCD/LED, flex de video, backlight)
9. `Internal damage` (Impactos físicos internos o sulfatación)
10. `Internal storage` (Disco duro mecánico o unidad SSD)
11. `Multiple` (Combinación de dos o más fallas simultáneas)
12. `Operating system` (Corrupción del sistema operativo o virus)
13. `Other` (Fallas no clasificadas en otras categorías)
14. `Overheating` (Sobrecalentamiento, disipador tapado, pasta seca)
15. `Performance` (Lentitud extrema o degradación de velocidad)
16. `Ports/slots/connectors` (Puertos USB, HDMI, jack de audio o conector DC)
17. `Power/battery` (Batería agotada, cargador, circuito de alimentación)
18. `System board` (Placa madre, chipset, soldaduras BGA o MOSFETs)
19. `Virus/malware` (Infección grave por software malicioso)

---

## 4. Comparación de Algoritmos Evaluados

| Algoritmo | CV F1 Macro (Criterio Rector) | Test Accuracy | Test F1 Macro | Test ROC-AUC | Estado |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | **0.6195** | **0.7160** | **0.6164** | **0.9269** | 🥇 **Seleccionado** |
| Support Vector Machine (SVM) | 0.5760 | 0.7038 | 0.5834 | 0.9298 | 🥈 2° Lugar |
| Regresión Logística | 0.5626 | 0.6672 | 0.5848 | 0.9164 | 🥉 3° Lugar |
| Árbol de Decisión | 0.5079 | 0.5993 | 0.5322 | 0.7807 | 4° Lugar |
| K-Nearest Neighbors (KNN) | 0.3878 | 0.5279 | 0.3858 | 0.7680 | 5° Lugar |
| Naive Bayes | 0.3181 | 0.6237 | 0.3885 | 0.8890 | 6° Lugar |

### Hiperparámetros del Modelo Ganador (`RandomForestClassifier`):
- `n_estimators`: 200 árboles de decisión.
- `class_weight`: `balanced_subsample` (corrige el desbalance severo de clases en cada árbol de forma dinámica).
- `random_state`: 42 (reproducibilidad exacta).
- `n_jobs`: -1 (procesamiento paralelo en todos los núcleos disponibles).
