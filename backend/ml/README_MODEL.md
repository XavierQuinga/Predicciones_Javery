# Memoria Técnica del Pipeline de Machine Learning

**Proyecto:** Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos  
**Caso de Estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Modelo Oficial:** `03_MODELO/mejor_modelo_diagnostico_fallas.joblib`

---

## 1. Descripción del Modelo

El modelo es una canalización integral (`sklearn.pipeline.Pipeline`) que acopla el preprocesamiento de características heterogéneas (texto en lenguaje natural, variables categóricas de hardware y variables numéricas de antigüedad) con un estimador probabilístico multiclase `RandomForestClassifier`.

### Arquitectura del Pipeline:
```
DataFrame (tipo_equipo, marca, antiguedad_anios, sintoma)
│
├── sintoma ─────────► TfidfVectorizer (char_wb, ngrams 3-5, 12000 feats) ──┐
├── tipo_equipo,marca► OneHotEncoder (handle_unknown='ignore') ──────────────┼► ColumnTransformer
└── antiguedad_anios ─► SimpleImputer(median) + MinMaxScaler() ─────────────┘       │
                                                                                    ▼
                                                                        RandomForestClassifier
                                                                        (200 árboles, balanced_subsample)
                                                                                    │
                                                                                    ▼
                                                                        Diagnóstico (19 clases) + Probabilidades
```

---

## 2. Especificación de Features de Entrada

| Feature | Tipo | Dominio / Descripción | Tratamiento en Pipeline |
| :--- | :--- | :--- | :--- |
| `tipo_equipo` | Categórica | `laptop`, `desktop` | `OneHotEncoder` |
| `marca` | Categórica | Fabricante del equipo (90 marcas aprendidas) o `Sin marca` | `OneHotEncoder(handle_unknown='ignore')` |
| `antiguedad_anios` | Numérica | Años de vida del equipo (0.0 a 39.0 años) | `SimpleImputer(strategy='median')` [6.0 años] + `MinMaxScaler()` |
| `sintoma` | Texto | Descripción del fallo reportado por el cliente | `TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5))` |

---

## 3. Clases Diagnósticas Predichas (19 Clases CompCat)

1. `Boot`
2. `Case/chassis`
3. `Configuration`
4. `Integrated keyboard`
5. `Integrated media component`
6. `Integrated optical drive`
7. `Integrated pointing device`
8. `Integrated screen`
9. `Internal damage`
10. `Internal storage`
11. `Multiple`
12. `Operating system`
13. `Other`
14. `Overheating`
15. `Performance`
16. `Ports/slots/connectors`
17. `Power/battery`
18. `System board`
19. `Virus/malware`

---

## 4. Métricas Oficiales de Evaluación

Evaluado sobre un conjunto de prueba independiente de 574 registros con partición estratificada 80/20 y 3-fold cross-validation:

- **Exactitud en Prueba (Test Accuracy):** `71.60%`
- **F1-Score Macro en Validación Cruzada:** `0.6195`
- **F1-Score Macro en Prueba:** `0.6164`
- **ROC-AUC Macro One-vs-Rest:** `0.9269`
- **Precisión Macro en Prueba:** `0.6463`
- **Sensibilidad Macro en Prueba:** `0.6055`
- **F1-Score Ponderado (Weighted):** `0.7113`

---

## 5. Inferencia en Producción

```python
import joblib
import pandas as pd

# Carga (única al iniciar la aplicación)
pipeline = joblib.load("03_MODELO/mejor_modelo_diagnostico_fallas.joblib")

# Inferencia
registro = pd.DataFrame([{
    "tipo_equipo": "laptop",
    "marca": "Dell",
    "antiguedad_anios": 4.0,
    "sintoma": "no enciende, no emite sonidos y el cargador parpadea"
}])

prediccion = pipeline.predict(registro)[0]
probabilidades = pipeline.predict_proba(registro)[0]
confianza = float(probabilidades.max())
```
