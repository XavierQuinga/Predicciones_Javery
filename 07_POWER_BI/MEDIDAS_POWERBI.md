# CATÁLOGO DE MEDIDAS DAX PARA POWER BI

**Proyecto:** SISTEMA PREDICTIVO PARA DIAGNÓSTICO DE FALLAS EN EQUIPOS INFORMÁTICOS MEDIANTE TÉCNICAS DE ANÁLISIS DE DATOS E INTELIGENCIA ARTIFICIAL  
**Caso de estudio:** JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador  
**Autor:** Jimmy Xavier Quinga  
**Sección:** 07_POWER_BI  

---

## 1. Instrucciones de Implementación en Power BI Desktop

1. Cree una tabla dedicada para centralizar las medidas en su modelo. Para ello, en la pestaña **Inicio**, haga clic en **Especificar datos**, nombre la tabla como `_Medidas` y haga clic en **Cargar**.
2. Copie y pegue cada una de las siguientes expresiones DAX creando una **Nueva medida** dentro de `_Medidas`.
3. Aplique el formato de número, moneda o porcentaje indicado en cada caso.

---

## 2. Medidas para la Página 1: Resumen Operativo JAVERY
*Tabla de origen:* `JAVERY_Operativo`

### 2.1. Total de Órdenes de Servicio
```dax
Total Ordenes = 
COUNTROWS(JAVERY_Operativo)
```
*Formato:* Número entero (General).  
*Resultado esperado:* 6.

---

### 2.2. Cantidad de Equipos Atendidos
```dax
Total Equipos Atendidos = 
DISTINCTCOUNT(JAVERY_Operativo[orden_servicio])
```
*Formato:* Número entero.  
*Resultado esperado:* 6.

---

### 2.3. Tipos de Fallas Registradas
```dax
Fallas Registradas = 
DISTINCTCOUNT(JAVERY_Operativo[tipo_falla_original])
```
*Formato:* Número entero.  
*Resultado esperado:* 6.

---

### 2.4. Costo Total de Reparaciones
```dax
Costo Total USD = 
SUM(JAVERY_Operativo[costo_usd])
```
*Formato:* Moneda ($ #,##0.00).  
*Resultado esperado:* $275.00 USD.

---

### 2.5. Costo Promedio de Reparación
```dax
Costo Promedio USD = 
AVERAGE(JAVERY_Operativo[costo_usd])
```
*Formato:* Moneda ($ #,##0.00).  
*Resultado esperado:* $45.83 USD.

---

### 2.6. Tiempo Promedio de Diagnóstico (Horas)
```dax
Tiempo Promedio Diagnostico (h) = 
AVERAGE(JAVERY_Operativo[tiempo_diagnostico_horas])
```
*Formato:* Decimal (1 decimal).  
*Resultado esperado:* 3.0 h.

---

### 2.7. Tiempo Promedio de Reparación (Horas Laborales)
```dax
Tiempo Promedio Reparacion (h) = 
AVERAGE(JAVERY_Operativo[tiempo_reparacion_horas])
```
*Formato:* Decimal (1 decimal).  
*Resultado esperado:* 7.0 h.

---

### 2.8. Equipos en Estado Operable
```dax
Equipos Operables = 
COUNTROWS(
    FILTER(
        JAVERY_Operativo,
        JAVERY_Operativo[estado_norm] = "Operable"
    )
)
```
*Formato:* Número entero.  
*Resultado esperado:* 6.

---

### 2.9. Porcentaje de Equipos Operables
```dax
Porcentaje Operables = 
DIVIDE(
    [Equipos Operables],
    [Total Ordenes],
    0
)
```
*Formato:* Porcentaje (0.0%).  
*Resultado esperado:* 100.0%.

---

## 3. Medidas para la Página 2: Evaluación del Modelo Predictivo
*Tablas de origen:* `Resultados_Modelos`, `Metricas_Por_Clase`, `Curva_Aprendizaje`

### 3.1. Identificación del Mejor Modelo
```dax
Modelo Ganador = 
CALCULATE(
    SELECTEDVALUE(Resultados_Modelos[Modelo]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Texto.  
*Resultado esperado:* `Random_Forest`.

---

### 3.2. F1 Macro CV del Mejor Modelo (Criterio Rector)
```dax
Mejor F1 Macro CV = 
CALCULATE(
    MAX(Resultados_Modelos[CV_F1_macro_media]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.6195.

---

### 3.3. Accuracy en Test del Mejor Modelo
```dax
Mejor Test Accuracy = 
CALCULATE(
    MAX(Resultados_Modelos[Test_Accuracy]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Porcentaje (0.00%).  
*Resultado esperado:* 71.60%.

---

### 3.4. Precision Macro en Test del Mejor Modelo
```dax
Mejor Test Precision Macro = 
CALCULATE(
    MAX(Resultados_Modelos[Test_Precision_macro]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.6463.

---

### 3.5. Recall Macro en Test del Mejor Modelo
```dax
Mejor Test Recall Macro = 
CALCULATE(
    MAX(Resultados_Modelos[Test_Recall_macro]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.6055.

---

### 3.6. F1 Macro en Test del Mejor Modelo
```dax
Mejor Test F1 Macro = 
CALCULATE(
    MAX(Resultados_Modelos[Test_F1_macro]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.6164.

---

### 3.7. ROC-AUC Macro OVR del Mejor Modelo
```dax
Mejor Test ROC AUC = 
CALCULATE(
    MAX(Resultados_Modelos[Test_ROC_AUC_macro_OVR]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.9269.

---

### 3.8. F1 Ponderado (Weighted) en Test del Mejor Modelo
```dax
Mejor Test F1 Weighted = 
CALCULATE(
    MAX(Resultados_Modelos[Test_F1_weighted]),
    Resultados_Modelos[Es_Mejor_Modelo] = "Sí"
)
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.7113.

---

### 3.9. F1-Score Promedio Simple por Clase
```dax
F1 Promedio Clases = 
AVERAGE(Metricas_Por_Clase[f1-score])
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.6164.

---

### 3.10. Total de Casos Evaluados en Prueba
```dax
Total Casos Prueba = 
SUM(Metricas_Por_Clase[support])
```
*Formato:* Número entero.  
*Resultado esperado:* 574.

---

### 3.11. Brecha Promedio de Generalización en la Curva de Aprendizaje
```dax
Brecha Promedio Train Val F1 = 
AVERAGE(Curva_Aprendizaje[brecha_f1])
```
*Formato:* Decimal (4 decimales).  
*Resultado esperado:* 0.4373 (refleja la diferencia típica entre memorización en entrenamiento y generalización en validación).

---

## 4. Medidas para la Página 3: Validación Operativa JAVERY
*Tabla de origen:* `JAVERY_Validacion`

### 4.1. Total de Casos Reales Evaluados
```dax
Total Validaciones JAVERY = 
COUNTROWS(JAVERY_Validacion)
```
*Formato:* Número entero.  
*Resultado esperado:* 4.

---

### 4.2. Número de Aciertos del Modelo
```dax
Total Aciertos JAVERY = 
SUM(JAVERY_Validacion[acierto_num])
```
*Formato:* Número entero.  
*Resultado esperado:* 0.

---

### 4.3. Número de Errores del Modelo
```dax
Total Errores JAVERY = 
[Total Validaciones JAVERY] - [Total Aciertos JAVERY]
```
*Formato:* Número entero.  
*Resultado esperado:* 4.

---

### 4.4. Porcentaje de Aciertos (Accuracy Operatoria Exploratoria)
```dax
Porcentaje Aciertos JAVERY = 
DIVIDE(
    [Total Aciertos JAVERY],
    [Total Validaciones JAVERY],
    0
)
```
*Formato:* Porcentaje (0.00%).  
*Resultado esperado:* 0.00%.

---

### 4.5. Porcentaje de Errores Operatorios
```dax
Porcentaje Errores JAVERY = 
DIVIDE(
    [Total Errores JAVERY],
    [Total Validaciones JAVERY],
    0
)
```
*Formato:* Porcentaje (0.00%).  
*Resultado esperado:* 100.00%.

---

### 4.6. Nivel de Confianza Promedio del Modelo
```dax
Confianza Promedio Diagnostico = 
AVERAGE(JAVERY_Validacion[confianza_max])
```
*Formato:* Porcentaje (0.0%).  
*Resultado esperado:* 34.5% (muestra que el modelo clasificó con baja certeza y no con falsas convicciones extremas).

---

### 4.7. Nivel de Confianza Mínimo
```dax
Confianza Minima Diagnostico = 
MIN(JAVERY_Validacion[confianza_max])
```
*Formato:* Porcentaje (0.0%).  
*Resultado esperado:* 25.5% (`OS-006`).

---

### 4.8. Nivel de Confianza Máximo
```dax
Confianza Maxima Diagnostico = 
MAX(JAVERY_Validacion[confianza_max])
```
*Formato:* Porcentaje (0.0%).  
*Resultado esperado:* 41.5% (`OS-004`).

---

## 5. Cuadro Resumen de Medidas y Tablas

| Medida DAX | Tabla Origen | Columna Involucrada | Visual Sugerida |
| :--- | :--- | :--- | :--- |
| `Total Ordenes` | `JAVERY_Operativo` | `orden_servicio` | Tarjeta KPI |
| `Costo Promedio USD` | `JAVERY_Operativo` | `costo_usd` | Tarjeta KPI |
| `Tiempo Promedio Diagnostico (h)` | `JAVERY_Operativo` | `tiempo_diagnostico_horas` | Tarjeta KPI |
| `Porcentaje Operables` | `JAVERY_Operativo` | `estado_norm` | Medidor / Tarjeta |
| `Modelo Ganador` | `Resultados_Modelos` | `Modelo` | Tarjeta Destacada |
| `Mejor F1 Macro CV` | `Resultados_Modelos` | `CV_F1_macro_media` | Tarjeta KPI |
| `Mejor Test Accuracy` | `Resultados_Modelos` | `Test_Accuracy` | Tarjeta KPI |
| `Mejor Test ROC AUC` | `Resultados_Modelos` | `Test_ROC_AUC_macro_OVR` | Tarjeta KPI |
| `Total Validaciones JAVERY`| `JAVERY_Validacion` | `orden_servicio` | Tarjeta KPI |
| `Total Aciertos JAVERY` | `JAVERY_Validacion` | `acierto_num` | Tarjeta KPI |
| `Porcentaje Aciertos JAVERY`| `JAVERY_Validacion` | Medida derivada | Tarjeta KPI / Medidor |
| `Confianza Promedio Diagnostico` | `JAVERY_Validacion` | `confianza_max` | Tarjeta KPI |
