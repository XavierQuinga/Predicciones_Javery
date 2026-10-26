# MODELO DE DATOS Y ARQUITECTURA DE INFORMACIÓN EN POWER BI

**Proyecto:** SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL  
**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Sección:** 07_POWER_BI  

---

## 1. Principio Rector del Modelo de Datos

> [!IMPORTANT]
> **Desacoplamiento Temático y Aislamiento Metodológico:**
> Para preservar la integridad analítica exigida en la memoria técnica, el modelo de datos en Power BI se implementa mediante **tres grupos analíticos independientes (modelo modular desacoplado)**. 
> - **No se deben forzar relaciones artificiales** entre los datos operativos reales de JAVERY y los resultados experimentales de Open Repair / CompCat.
> - Cada página del reporte responde a un dominio conceptual específico con sus propias tablas y medidas.

---

## 2. Catálogo de Tablas a Importar

Las siguientes 6 tablas han sido preparadas con codificación UTF-8-sig y nombres de columnas estandarizados en la carpeta `07_POWER_BI/`:

| Archivo Fuente | Nombre de Tabla Sugerido en Power BI | Granularidad / Descripción | Clave Primaria / Identificador |
| :--- | :--- | :--- | :--- |
| `PBI_JAVERY_Operativo.csv` | **`JAVERY_Operativo`** | 1 fila por orden de servicio atendida en JAVERY (6 casos) | `orden_servicio` |
| `PBI_Resultados_Modelos.csv` | **`Resultados_Modelos`** | 1 fila por algoritmo evaluado (6 algoritmos) | `Modelo` |
| `PBI_Metricas_Por_Clase.csv` | **`Metricas_Por_Clase`** | 1 fila por clase de falla en el modelo ganador (19 clases) | `Tipo_Falla` |
| `PBI_Curva_Aprendizaje.csv` | **`Curva_Aprendizaje`** | 1 fila por corte de entrenamiento evaluado (4 cortes) | `tamano_entrenamiento` |
| `PBI_JAVERY_Validacion.csv` | **`JAVERY_Validacion`** | 1 fila por caso evaluado con el modelo ganador (4 casos) | `orden_servicio` |
| `PBI_Taxonomia_CompCat.csv` | **`Dim_Taxonomia_CompCat`** | Catálogo oficial de 20 categorías diagnósticas | `fault_type_id` / `fault_type` |

---

## 3. Diccionario de Datos por Tabla

### 3.1. Tabla: `JAVERY_Operativo` (Página 1 - Operativo)
- **`orden_servicio`** *(Texto, Clave)*: Identificador único (`OS-001` a `OS-006`).
- **`fecha_ingreso`** *(Fecha)*: Fecha de recepción del equipo (Enero 2026).
- **`tipo_equipo_norm`** *(Texto, Dimensión)*: Tipo normalizado (`laptop`, `desktop`, `celular`, `impresora`).
- **`marca_norm`** *(Texto, Dimensión)*: Marca (`HP`, `Lenovo`, `Samsung`, `Epson`, `Sin marca`).
- **`anio_equipo`** *(Número entero)*: Año de fabricación declarado.
- **`antiguedad_anios`** *(Número entero)*: Años de antigüedad al momento del ingreso.
- **`sintoma_limpio`** *(Texto)*: Síntoma reportado por el cliente al ingresar.
- **`tipo_falla_original`** *(Texto)*: Diagnóstico técnico institucional de JAVERY.
- **`tipo_falla_compcat`** *(Texto, Dimensión)*: Homologación a la taxonomía internacional CompCat.
- **`fault_type_id`** *(Número entero)*: Identificador numérico de la falla CompCat.
- **`componente_danado_limpio`** *(Texto, Dimensión)*: Pieza o módulo físico defectuoso (pantalla, bobinas, chip de video, fuente, SO).
- **`solucion_limpia`** *(Texto)*: Procedimiento correctivo aplicado.
- **`tiempo_diagnostico_horas`** *(Número decimal, Métrica)*: Horas dedicadas a inspección y diagnóstico.
- **`tiempo_reparacion_std`** *(Texto)*: Expresión institucional del tiempo de reparación.
- **`tiempo_reparacion_horas`** *(Número decimal, Métrica)*: Horas laborales de reparación (2 h para celular, 8 h para jornada de 1 día).
- **`costo_usd`** *(Número decimal, Métrica)*: Costo de reparación en dólares (rango $25 a $65 USD).
- **`estado_norm`** *(Texto, Dimensión)*: Estado final del equipo (`Operable`).
- **`compatible_compcat`** *(Texto)*: `Sí` (laptops/desktops) / `No` (otros dispositivos).

### 3.2. Tabla: `Resultados_Modelos` (Página 2 - Modelo Predictivo)
- **`Modelo`** *(Texto, Clave)*: Nombre del algoritmo (`Random_Forest`, `SVM`, `Regresion_logistica`, `Arbol_decision`, `KNN`, `Naive_Bayes`).
- **`CV_Accuracy_media`** *(Decimal)*: Exactitud promedio en validación cruzada 3-fold.
- **`CV_Precision_macro_media`** *(Decimal)*: Precisión macro promedio en CV.
- **`CV_Recall_macro_media`** *(Decimal)*: Sensibilidad macro promedio en CV.
- **`CV_F1_macro_media`** *(Decimal, Métrica Principal)*: F1 macro promedio en CV.
- **`Test_Accuracy`** *(Decimal)*: Exactitud en el conjunto de prueba (574 registros).
- **`Test_Precision_macro`** *(Decimal)*: Precisión macro en prueba.
- **`Test_Recall_macro`** *(Decimal)*: Sensibilidad macro en prueba.
- **`Test_F1_macro`** *(Decimal)*: F1 macro en prueba.
- **`Test_F1_weighted`** *(Decimal)*: F1 ponderado por soporte en prueba.
- **`Test_ROC_AUC_macro_OVR`** *(Decimal)*: Área bajo la curva ROC multiclase One-vs-Rest.
- **`Es_Mejor_Modelo`** *(Texto)*: Indicador booleano (`Sí` para Random Forest, `No` para los demás).
- **`Ranking_CV_F1`** *(Entero)*: Posición de mérito según CV F1 macro (1 a 6).

### 3.3. Tabla: `Metricas_Por_Clase` (Página 2 - Detalle del Mejor Modelo)
- **`Tipo_Falla`** *(Texto, Clave)*: Nombre de la clase diagnóstica (19 categorías).
- **`precision`** *(Decimal)*: Precisión de la clase en el conjunto de prueba.
- **`recall`** *(Decimal)*: Sensibilidad (recall) de la clase en el conjunto de prueba.
- **`f1-score`** *(Decimal)*: F1 de la clase en el conjunto de prueba.
- **`support`** *(Entero)*: Cantidad de casos de prueba reales pertenecientes a la clase.

### 3.4. Tabla: `Curva_Aprendizaje` (Página 2 - Comportamiento del Aprendizaje)
- **`tamano_entrenamiento`** *(Entero, Clave)*: Cantidad de instancias de entrenamiento (382, 764, 1146, 1528).
- **`porcentaje_datos_train`** *(Entero)*: Porcentaje respecto al set total de entrenamiento (25%, 50%, 75%, 100%).
- **`f1_train_media`** *(Decimal)*: F1 macro medio en el subconjunto de entrenamiento.
- **`f1_train_std`** *(Decimal)*: Desviación estándar del F1 en entrenamiento.
- **`f1_validacion_media`** *(Decimal)*: F1 macro medio en validación cruzada.
- **`f1_validacion_std`** *(Decimal)*: Desviación estándar del F1 en validación.
- **`brecha_f1`** *(Decimal)*: Diferencia `f1_train_media - f1_validacion_media`.

### 3.5. Tabla: `JAVERY_Validacion` (Página 3 - Validación Operativa)
- **`orden_servicio`** *(Texto, Clave)*: `OS-003`, `OS-004`, `OS-005`, `OS-006`.
- **`tipo_equipo`** *(Texto)*: `laptop`, `desktop`.
- **`marca`** *(Texto)*: `HP`, `Lenovo`, `Sin marca`.
- **`antiguedad_anios`** *(Entero)*: Antigüedad en años.
- **`sintoma`** *(Texto)*: Síntoma textual ingresado.
- **`tipo_falla_real`** *(Texto)*: Falla real diagnosticada (`System board`, `Power/battery`, `Boot`).
- **`prediccion_modelo`** *(Texto)*: Falla predicha por Random Forest (`Configuration`).
- **`acierto`** *(Booleano)*: `False`.
- **`resultado_validacion`** *(Texto)*: `Error` / `Acierto`.
- **`acierto_num`** *(Entero)*: 0 (para facilitar sumas y promedios DAX).
- **`confianza_max`** *(Decimal)*: Probabilidad predicha más alta (0.255 a 0.415).
- **`fuente`** *(Texto)*: `JAVERY`.

### 3.6. Tabla: `Dim_Taxonomia_CompCat` (Dimensión Referencial)
- **`fault_type_id`** *(Entero, Clave)*: ID oficial (1 a 20).
- **`fault_type`** *(Texto)*: Nombre en inglés estandarizado.
- **`descripcion_es`** *(Texto)*: Definición en español del alcance del tipo de falla.

---

## 4. Relaciones Recomendadas y Cardinalidad

```
                      ┌───────────────────────────┐
                      │   Dim_Taxonomia_CompCat   │
                      │      (fault_type)         │
                      └─────────────┬─────────────┘
                                    │ (1)
                                    │
                                    │ Filtro cruzado: Única
                                    │ Cardinalidad: 1 a Varios (1:N)
                                    │
                                    ▼ (*)
                      ┌───────────────────────────┐
                      │     Metricas_Por_Clase    │
                      │        (Tipo_Falla)       │
                      └───────────────────────────┘

  [Tablas Independientes Desacopladas - Sin relaciones forzadas]
  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
  │    JAVERY_Operativo   │  │   Resultados_Modelos  │  │   Curva_Aprendizaje   │
  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘
  ┌───────────────────────┐
  │   JAVERY_Validacion   │
  └───────────────────────┘
```

### Justificación Técnica de las Relaciones:
1. **Relación Activa Válida:**
   - De `Dim_Taxonomia_CompCat[fault_type]` (1) a `Metricas_Por_Clase[Tipo_Falla]` (N).
   - *Finalidad:* Permite enriquecer la visualización de la Página 2 mostrando la descripción en español de cada falla evaluada.
2. **Relación Opcional (Inactiva o Evitada):**
   - No relacionar `JAVERY_Operativo[orden_servicio]` con `JAVERY_Validacion[orden_servicio]`, debido a que `JAVERY_Operativo` contiene 6 registros (incluyendo celular e impresora fuera del alcance de predicción) mientras que `JAVERY_Validacion` contiene los 4 casos específicos evaluados por el modelo. Mantenerlas independientes previene confusiones en el contexto de filtro de los dashboards.

---

## 5. Distribución de Visualizaciones por Página en Power BI

### PÁGINA 1: RESUMEN OPERATIVO JAVERY
*Fuente de datos:* `JAVERY_Operativo`
- **KPI Card 1:** Total de Órdenes Atendidas (`Total Ordenes` = 6).
- **KPI Card 2:** Costo Promedio de Reparación (`Costo Promedio USD` = $45.83 USD).
- **KPI Card 3:** Tiempo Promedio de Diagnóstico (`Tiempo Promedio Diagnostico (h)` = 3.0 h).
- **KPI Card 4:** Operabilidad de Equipos (`Porcentaje Operables` = 100%).
- **Gráfico de Barras Horizontal:** Distribución de Equipos por Tipo (`tipo_equipo_norm`).
- **Gráfico de Columnas:** Costo Promedio por Tipo de Falla (`tipo_falla_original`).
- **Gráfico de Anillo:** Participación por Marca (`marca_norm`).
- **Tabla Detallada:** `orden_servicio`, `fecha_ingreso`, `tipo_equipo_norm`, `marca_norm`, `sintoma_limpio`, `componente_danado_limpio`, `costo_usd`, `estado_norm`.
- **Segmentadores (Slicers):** Tipo de Equipo, Marca, Estado.

---

### PÁGINA 2: EVALUACIÓN DEL MODELO PREDICTIVO
*Fuentes de datos:* `Resultados_Modelos`, `Metricas_Por_Clase`, `Curva_Aprendizaje`
- **Tarjeta Destacada (Hero KPI):** Mejor Modelo $\rightarrow$ **Random Forest**.
- **Tarjetas KPI del Modelo Ganador:**
  * F1 Macro CV (Criterio Principal): **0.6195**.
  * Test Accuracy: **71.60%**.
  * Test F1 Macro: **0.6164**.
  * Test ROC-AUC Macro: **0.9269**.
- **Gráfico de Columnas Agrupadas:** Comparación de los 6 algoritmos (`Resultados_Modelos`), contrastando `CV_F1_macro_media`, `Test_F1_macro` y `Test_Accuracy`.
- **Gráfico de Barras Horizontales:** F1-Score por Tipo de Falla (`Metricas_Por_Clase`), ordenado de menor a mayor desempeño.
- **Gráfico de Líneas (Curva de Aprendizaje):** `tamano_entrenamiento` en el eje X, con dos líneas: `f1_train_media` y `f1_validacion_media`.
- **Imágenes Integradas:**
  * `05_GRAFICOS/matriz_confusion_mejor_modelo.png`
  * `05_GRAFICOS/roc_multiclase_mejor_modelo.png`
  * `05_GRAFICOS/curva_aprendizaje_mejor_modelo.png`

---

### PÁGINA 3: VALIDACIÓN OPERATIVA JAVERY
*Fuente de datos:* `JAVERY_Validacion`
- **Banner Informativo:** *Validación Operativa Exploratoria (Muestra reducida N=4: evaluación en entorno real).*
- **KPI Card 1:** Casos Evaluados (`Total Validaciones` = 4).
- **KPI Card 2:** Aciertos del Modelo (`Total Aciertos` = 0).
- **KPI Card 3:** Desviaciones Diagnósticas (`Total Errores` = 4).
- **KPI Card 4:** Confianza Promedio del Diagnóstico (`Confianza Promedio` = 34.5%).
- **Tabla de Validación Caso por Caso:**
  * Columnas: `orden_servicio`, `tipo_equipo`, `marca`, `antiguedad_anios`, `sintoma`, `tipo_falla_real`, `prediccion_modelo`, `resultado_validacion`, `confianza_max`.
- **Panel de Hallazgos Técnicos:** Explicación de la predicción uniforme en `Configuration` debido al desacople de idioma (español en JAVERY vs. inglés/alemán en Open Repair) y el bajo umbral de probabilidad resultante.
