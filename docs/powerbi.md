# Guía de Conexión de Power BI con PostgreSQL

**Proyecto:** Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos  
**Caso de Estudio:** JAVERY – Quito, Ecuador  

---

## 1. Arquitectura de Integración

En lugar de exportar archivos CSV manualmente tras cada diagnóstico, el sistema opera con **PostgreSQL como repositorio central**. Cada predicción realizada desde el formulario web queda registrada inmediatamente en la base de datos, permitiendo a Power BI actualizarse en tiempo real o mediante actualización programada.

```
Técnico en la Web ──► FastAPI ──► PostgreSQL (Tabla 'predicciones') ──► Vista 'vw_powerbi_predicciones' ──► Power BI
```

---

## 2. Paso a Paso para Conectar Power BI Desktop

1. Abrir **Power BI Desktop**.
2. En la cinta superior, hacer clic en **Obtener datos** $\rightarrow$ **Más...**
3. Seleccionar **Base de datos** $\rightarrow$ **Base de datos PostgreSQL** y pulsar **Conectar**.
4. En el diálogo de configuración ingresar:
   - **Servidor:** `localhost:5432` (o la dirección del servidor Azure: `midb.postgres.database.azure.com:5432`).
   - **Base de datos:** `diagnostico_ti`.
   - **Modo de conectividad:**
     * **Importar:** Recomendado para análisis veloz con filtros cruzados.
     * **DirectQuery:** Recomendado si se requiere ver la nueva orden inmediatamente en el panel al pulsar F5.
5. Si solicita credenciales de autenticación:
   - Seleccionar la pestaña **Base de datos**.
   - **Nombre de usuario:** `postgres` (o el configurado en `.env`).
   - **Contraseña:** la contraseña definida en `DB_PASSWORD`.
   - **Nivel de cifrado:** Si se conecta a Azure, habilitar SSL.
6. En el **Navegador de tablas y vistas**, seleccionar:
   - ✅ `vw_powerbi_predicciones` (Vista unificada y lista para graficar).
   - Opcionalmente la tabla `predicciones` o las tablas auxiliares de catálogo CompCat.
7. Hacer clic en **Cargar**.

---

## 3. Estructura de la Vista `vw_powerbi_predicciones`

La vista SQL [`database/views_powerbi.sql`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/database/views_powerbi.sql) entrega los siguientes campos listos para usar:

| Campo | Tipo | Uso en Power BI |
| :--- | :--- | :--- |
| `id_prediccion` | Clave entera | Conteo de casos únicos. |
| `fecha` | Fecha | Eje de tiempo para tendencias diarias. |
| `anio`, `nombre_mes`, `dia_semana` | Dimensiones | Segmentadores temporales y jerarquías. |
| `tipo_equipo` | Texto | Segmentador / Gráfico de anillo (laptop vs. desktop). |
| `marca` | Texto | Gráfico de barras de fallas por fabricante. |
| `rango_antiguedad` | Categoría | Segmentador de equipos (0-2 años, 3-5 años, etc.). |
| `falla_predicha` | Dimensión | Falla diagnosticada (ranking de causas de ingreso). |
| `porcentaje_confianza` | Numérico (%) | Tarjeta KPI de certeza promedio y distribución. |
| `nivel_certeza` | Categoría | Segmentador: Alta (>=70%), Media (45-69%), Baja (<45%). |
| `top1_falla`, `top2_falla`, `top3_falla` | Texto | Análisis de ambigüedad diagnóstica. |
| `origen_registro` | Dimensión | Filtro entre `PREDICCION_SISTEMA` e `HISTORICO`. |

---

## 4. Medidas DAX Recomendadas para el Reporte

Crear una tabla vacía `_Medidas` y agregar las siguientes fórmulas verificadas:

```dax
// Total de Diagnósticos
Total Diagnosticos = COUNTROWS(vw_powerbi_predicciones)

// Diagnósticos Nuevos desde la Web
Diagnosticos Web = CALCULATE(
    COUNTROWS(vw_powerbi_predicciones),
    vw_powerbi_predicciones[origen_registro] = "PREDICCION_SISTEMA"
)

// Confianza Promedio General
Confianza Promedio Pct = AVERAGE(vw_powerbi_predicciones[porcentaje_confianza])

// Diagnósticos de Alta Certeza
Diagnosticos Alta Certeza = CALCULATE(
    COUNTROWS(vw_powerbi_predicciones),
    vw_powerbi_predicciones[porcentaje_confianza] >= 70
)

// Porcentaje de Alta Certeza
Pct Alta Certeza = DIVIDE([Diagnosticos Alta Certeza], [Total Diagnosticos], 0)
```

---

## 5. Consultas SQL de Diagnóstico Técnico

En el archivo [`database/queries_powerbi.sql`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/database/queries_powerbi.sql) se encuentran disponibles 7 consultas directas para verificar la integridad de los datos o generar reportes tabulares para la memoria técnica.
