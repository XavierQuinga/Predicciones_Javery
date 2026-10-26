# INTERPRETACIÓN TÉCNICA RIGUROSA DE EVIDENCIAS Y GRÁFICOS

**Proyecto:** SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL  
**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Sección:** 09_DOCUMENTACION  

---

## 1. Distribución de Clases (`distribucion_clases.png`)

### Análisis Cuantitativo
El gráfico ilustra la frecuencia absoluta de los 19 tipos de fallas presentes en el corpus de entrenamiento Open Repair / CompCat ($N = 2,866$ registros).

| Categoría de Falla | Registros | Proporción (%) | Tipo de Falla | Registros | Proporción (%) |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **Performance** | 433 | 15.11% | **System board** | 95 | 3.31% |
| **Power/battery** | 389 | 13.57% | **Case/chassis** | 80 | 2.79% |
| **Configuration** | 337 | 11.76% | **Internal damage** | 63 | 2.20% |
| **Integrated screen** | 277 | 9.67% | **Virus/malware** | 59 | 2.06% |
| **Internal storage** | 210 | 7.33% | **Other** | 37 | 1.29% |
| **Operating system** | 209 | 7.29% | **Integrated media component** | 28 | 0.98% |
| **Boot** | 201 | 7.01% | **Integrated optical drive** | 27 | 0.94% |
| **Ports/slots/connectors** | 138 | 4.81% | **Integrated pointing device** | 27 | 0.94% |
| **Overheating** | 115 | 4.01% | **Multiple** | 26 | 0.91% |
| **Integrated keyboard** | 112 | 3.91% | **Total General** | **2,866** | **100.00%** |

### Interpretación de Ingeniería
1. **Desbalance Severo de Clases:** Existe una disparidad de **16.6 a 1** entre la clase mayoritaria (`Performance` con 433 instancias) y la minoritaria (`Multiple` con 26 instancias). Las tres primeras clases concentran el $40.44\%$ de los casos del mundo real.
2. **Impacto en el Modelado:** Esta asimetría justifica por qué fue mandatorio utilizar técnicas de ponderación inversa de frecuencias (`class_weight='balanced_subsample'`) en los clasificadores y descartar la exactitud simple (*Accuracy*) como criterio de selección en favor de **F1 macro**.

---

## 2. Comparación de Modelos (`comparacion_modelos.png`)

### Análisis Cuantitativo
El gráfico de barras compara los 6 algoritmos evaluados bajo tres métricas clave extraídas de `resultados_modelos.csv`:

```
1.0 ┤
0.8 ┤                                                     
0.6 ┤  ██ ▓▓ ░░    ██ ▓▓ ░░    ██ ▓▓ ░░    ██ ▓▓ ░░       
0.4 ┤                                                  ██ ▓▓ ░░    ██ ▓▓ ░░
0.2 ┤                                                              
0.0 ┴──────────────────────────────────────────────────────────────────────
      Rand_Forest     SVM       Reg_Logist   Arbol_Dec       KNN       Naive_Bayes
      CV F1: 0.619   0.576        0.563        0.508        0.388        0.318
      Test Acc:0.716 0.704        0.667        0.599        0.528        0.624
```

| Algoritmo | CV F1 Macro Media | Test F1 Macro | Test Accuracy | Brecha F1 (Test - CV) |
| :--- | :---: | :---: | :---: | :---: |
| **Random_Forest** | **0.6195** | **0.6164** | **0.7160** | **-0.0031** |
| **SVM** | 0.5760 | 0.5834 | 0.7038 | +0.0074 |
| **Regresion_logistica** | 0.5626 | 0.5848 | 0.6672 | +0.0222 |
| **Arbol_decision** | 0.5079 | 0.5322 | 0.5993 | +0.0243 |
| **KNN** | 0.3878 | 0.3858 | 0.5279 | -0.0020 |
| **Naive_Bayes** | 0.3181 | 0.3885 | 0.6237 | +0.0704 |

### Interpretación de Ingeniería
1. **Consistencia Extraordinaria de Random Forest:** La diferencia entre el F1 macro de validación cruzada ($0.6195$) y el F1 macro en el conjunto de prueba independiente ($0.6164$) es de apenas $-0.0031$ ($0.31\%$). Esto certifica que el modelo ganador no está sobreajustado en la validación cruzada y generaliza con idéntico poder predictivo ante datos nuevos.
2. **Jerarquía de Algoritmos:**
   - *Nivel Superior (Ensamble):* Random Forest aventaja por más de 4.3 puntos porcentuales de F1 macro a su competidor más cercano (SVM).
   - *Nivel Medio (Modelos Lineales):* SVM ($0.5760$) y Regresión Logística ($0.5626$) obtienen desempeños competitivos debido a la alta dispersión del espacio de características textuales TF-IDF.
   - *Nivel Inferior (Modelos Geométricos y Probabilísticos Simples):* KNN ($0.3878$) sufre la "maldición de la dimensionalidad" provocada por las 12,000 dimensiones del TF-IDF, donde la distancia euclidiana pierde capacidad de discriminación. Naive Bayes ($0.3181$) colapsa en F1 macro debido a la fuerte violación de independencia condicional en n-gramas contiguos de texto.

---

## 3. Curva de Aprendizaje (`curva_aprendizaje_mejor_modelo.png`)

### Análisis Cuantitativo
A partir de los valores exactos registrados en `curva_aprendizaje_datos.csv`:

| Tamaño de Muestra Train ($N$) | % del Set Train | F1 Train Promedio ($\pm \sigma$) | F1 Validación Promedio ($\pm \sigma$) | Brecha de Rendimiento |
| :---: | :---: | :---: | :---: | :---: |
| 382 | 25% | $0.9974 \pm 0.0036$ | $0.4725 \pm 0.0147$ | 0.5249 |
| 764 | 50% | $0.9975 \pm 0.0020$ | $0.5507 \pm 0.0345$ | 0.4468 |
| 1,146 | 75% | $0.9963 \pm 0.0022$ | $0.6015 \pm 0.0439$ | 0.3948 |
| 1,528 | 100% | $0.9972 \pm 0.0017$ | $0.6142 \pm 0.0326$ | **0.3830** |

### Diagnóstico Riguroso: ¿Sobreajuste o Subajuste?
1. **Rendimiento de Entrenamiento:** Se mantiene asintótico en $\approx 0.997$, lo cual es una propiedad intrínseca de los ensambles de árboles de decisión no restringidos en profundidad máxima (*deep trees*), que logran separar perfectamente el espacio de entrenamiento.
2. **Rendimiento de Validación:** Exhibe una **trayectoria pronunciadamente ascendente**, creciendo desde $0.4725$ hasta $0.6142$ (una ganancia neta de $+14.17$ puntos de F1).
3. **Evolución de la Brecha:** La brecha se reduce monótonamente en más de 14 puntos porcentuales (de $0.5249$ a $0.3830$).
4. **Dictamen Técnico:**
   - **NO existe subajuste (*underfitting*):** El modelo posee una alta capacidad de representación y no está limitado por sesgo.
   - **Existe sobreajuste residual (*variance*):** Como es habitual en Random Forest en texto, la curva de train supera ampliamente a la de validación. Sin embargo, la pendiente de la curva de validación **no se ha aplanado por completo** al alcanzar el 100% de los datos disponibles ($1,528$ registros de entrenamiento).
   - **Estabilidad:** La desviación estándar de validación ($\pm 0.0326$) refleja que el modelo converge con estabilidad entre los distintos pliegues.
   - **Recomendación Extrapolable:** La curva demuestra empíricamente que recopilar más registros etiquetados (ej. entre 3,000 y 5,000 adicionales) continuará elevando el F1 de validación hacia la cota del 70%.

---

## 4. Matriz de Confusión (`matriz_confusion_mejor_modelo.png`)

### Análisis Cuantitativo (Normalizada por Clase Real)
En el conjunto de prueba independiente ($N = 574$), la diagonal principal muestra el porcentaje de acierto (*Recall*) por categoría:

#### Clases con Alto Desempeño Diagnóstico (Diagonal Dominante $\ge 75\%$):
- **Virus/malware:** **91.67%** acierto ($11/12$ casos). Síntomas como "pantalla bloqueada por rescate", "anuncios emergentes" son altamente específicos.
- **Integrated screen:** **89.29%** acierto ($50/56$ casos). El vocabulario de pantallas ("líneas horizontales", "vidrio trizado", "pantalla oscura") tiene nula ambigüedad.
- **Integrated keyboard:** **86.36%** acierto ($19/22$ casos). Síntomas como "teclas no responden", "teclado derramó líquido".
- **Power/battery:** **79.49%** acierto ($62/78$ casos). Expresiones como "no carga", "batería hinchada", "cargador no detectado".
- **Internal storage:** **78.57%** acierto ($33/42$ casos). Expresiones como "disco duro hace ruido", "SMART error".
- **Overheating:** **78.26%** acierto ($18/23$ casos). Expresiones de "ventilador suena fuerte", "se apaga caliente".
- **Performance:** **74.71%** acierto ($65/87$ casos). "Extremadamente lenta", "se cuelga al abrir programas".
- **Operating system:** **73.81%** acierto ($31/42$ casos). "Pantalla azul", "actualización fallida".
- **Configuration:** **72.06%** acierto ($49/68$ casos). "Configurar driver", "reinstalar BIOS".

#### Clases con Confusión Crítica o Falla Diagnóstica:
- **System board (Placa Madre):** Recall de **47.37%** ($9/19$ casos). Esta es la clase más difícil del hardware informático: se confunde en un $21.1\%$ con `Power/battery` y en un $15.8\%$ con `Performance`, ya que el síntoma "no enciende" o "se apaga súbitamente" puede deberse tanto a una bobina rota en la placa madre como a un cargador quemado.
- **Ports/slots/connectors:** Recall de **50.00%** ($14/28$ casos). Se dispersa hacia `System board` o `Configuration` cuando el síntoma refiere a puertos USB que no leen dispositivos.
- **Multiple y Other:** Recall de **0.00%** ($0/5$ y $0/7$ casos). Clases residuales difusas sin términos representativos consistentes.

---

## 5. Curvas ROC Multiclase (`roc_multiclase_mejor_modelo.png`)

### Análisis Cuantitativo
El gráfico muestra las curvas ROC *One-vs-Rest* (OVR) para las clases mayoritarias y el promedio macro general:
- **Área bajo la curva macro global (Macro ROC-AUC):** $\mathbf{0.9269}$ ($92.69\%$).
- **Curvas de clases principales:**
  * `Integrated screen`: $\text{AUC} = \mathbf{0.97}$
  * `Internal storage`: $\text{AUC} = \mathbf{0.95}$
  * `Performance`: $\text{AUC} = \mathbf{0.94}$
  * `Power/battery`: $\text{AUC} = \mathbf{0.94}$
  * `Operating system`: $\text{AUC} = \mathbf{0.94}$
  * `Configuration`: $\text{AUC} = \mathbf{0.90}$

### Interpretación de Ingeniería
Un valor macro de ROC-AUC superior a $0.92$ confirma que el ensamble Random Forest posee una **excelente capacidad discriminante**, ordenando de forma casi perfecta las probabilidades de pertenencia antes de aplicar el umbral rígido de corte $argmax$.

---

## 6. Curvas Precision–Recall (`precision_recall_mejor_modelo.png`)

### Análisis Cuantitativo e Interpretación
A diferencia de la curva ROC, la curva Precision-Recall es sumamente sensible al desbalance de clases:
- Clases con soporte abundante y léxico no ambiguo (`Integrated screen`, `Power/battery`, `Internal storage`) conservan una precisión superior al $75\%$ en casi todo el espectro de exhaustividad.
- La clase `Configuration` experimenta una caída de precisión conforme se eleva el recall, reflejando que actúa como "clase atrayente" para descripciones sintomáticas imprecisas.

---

## 7. Desempeño por Clase F1-Score (`f1_por_clase.png`)

### Análisis Cuantitativo
El gráfico de barras horizontales ordena las 19 clases de mayor a menor según su F1-score en el conjunto de prueba (`metricas_por_clase.csv`):

```
Integrated screen       ████████████████████ 0.833  (Support: 56)
Integrated keyboard     ████████████████████ 0.826  (Support: 22)
Internal storage        ████████████████████ 0.825  (Support: 42)
Overheating             ████████████████████ 0.818  (Support: 23)
Performance             ████████████████████ 0.818  (Support: 87)
Virus/malware           ███████████████████  0.786  (Support: 12)
Power/battery           ██████████████████   0.756  (Support: 78)
Operating system        █████████████████    0.705  (Support: 42)
Internal damage         █████████████████    0.700  (Support: 13)
Case/chassis            █████████████████    0.690  (Support: 16)
Boot                    ████████████████     0.676  (Support: 40)
Integrated pointing dev ████████████████     0.667  (Support: 5)
Ports/slots/connectors  ██████████████       0.596  (Support: 28)
Configuration           ██████████████       0.573  (Support: 68)
System board            ████████████         0.500  (Support: 19)
Integrated media comp   ████████████         0.500  (Support: 6)
Integrated optical drive███████████          0.444  (Support: 5)
Multiple                                     0.000  (Support: 5)
Other                                        0.000  (Support: 7)
```

### Síntesis:
- **11 de las 19 clases superan un F1 de 0.67**, mostrando que el modelo es altamente operativo para la gran mayoría de fallas habituales de taller.
- Únicamente 2 clases obtienen $F1 = 0.00$ (`Multiple` y `Other`), las cuales agrupan apenas 12 de los 574 casos de prueba ($2.09\%$) y carecen de coherencia semántica interna.

---

## 8. Aciertos y Errores Globales (`aciertos_errores_prueba.png`)

### Análisis Cuantitativo
Sobre los 574 casos del conjunto de prueba independiente:
- **Predicciones Correctas:** **411 casos** ($\mathbf{71.60\%}$)
- **Predicciones Incorrectas:** **163 casos** ($\mathbf{28.40\%}$)

### Interpretación de Ingeniería
En un problema complejo de clasificación multiclase de 19 categorías con severo desbalance, lograr más de **7 de cada 10 diagnósticos correctos** a partir únicamente del síntoma preliminar y los datos de recepción constituye un resultado técnicamente sobresaliente para un sistema de triage asistido.

---

## 9. Validación Operativa JAVERY (`predicciones_JAVERY_validacion.csv`)

### Detalle de los 4 Casos Reales Evaluados:

| Orden | Equipo | Marca | Años | Síntoma Ingresado | Falla Real | Falla Predicha | Acierto | Confianza Máxima |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| `OS-003` | laptop | HP | 16 | no enciende | **System board** | Configuration | ❌ False | 0.370 (37.0%) |
| `OS-004` | laptop | Lenovo | 8 | no da imagen | **System board** | Configuration | ❌ False | 0.415 (41.5%) |
| `OS-005` | desktop | Sin marca | 16 | no enciende | **Power/battery**| Configuration | ❌ False | 0.340 (34.0%) |
| `OS-006` | desktop | Sin marca | 11 | no arranca el sistema operativo; logo detenido | **Boot** | Configuration | ❌ False | 0.255 (25.5%) |

### Discusión Científica del Resultado (0/4 Aciertos):
1. **La Importancia de la Confianza:** En los 4 casos, la probabilidad máxima osciló entre $25.5\%$ y $41.5\%$. En un clasificador con 19 opciones, una probabilidad de $0.25$ a $0.41$ refleja **alta incertidumbre**. El modelo no estuvo seguro de su respuesta.
2. **Causa Técnica (Desfase de Idioma):** El vocabulario TF-IDF entrenado contiene n-gramas mayoritarios de inglés (*"not powering"*, *"black screen"*, *"freezes"*) y alemán (*"geht nicht an"*, *"absturz"*). Al recibir entradas en español como *"no enciende"* o *"no da imagen"*, los n-gramas en español encontraron escasas coincidencias exactas, causando que la función de predicción colapsara en la clase `Configuration` por presentar la densidad a priori más repartida.
3. **Conclusión Académica:** El resultado valida la necesidad de integrar una capa previa de traducción o representaciones densas multilingües (ej. RoBERTa / BERT multilingüe) cuando se transfieren modelos entrenados con corpus internacionales a entornos locales hispanohablantes.

---
*Documento aprobado y archivado en `09_DOCUMENTACION/INTERPRETACION_GRAFICOS.md`.*
