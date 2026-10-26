-- =============================================================================
-- CONSULTAS SQL ANALÍTICAS PARA POWER BI Y CONTROL DE GESTIÓN TÉCNICA
-- Caso de Estudio: JAVERY – Sistema Predictivo de Diagnóstico de Fallas
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CANTIDAD TOTAL DE DIAGNÓSTICOS Y RESUMEN POR ORIGEN
-- -----------------------------------------------------------------------------
SELECT 
    origen_registro,
    COUNT(*) AS total_diagnosticos,
    ROUND(AVG(confianza) * 100, 2) AS promedio_confianza_pct,
    MIN(fecha_consulta) AS primer_registro,
    MAX(fecha_consulta) AS ultimo_registro
FROM predicciones
GROUP BY origen_registro;

-- -----------------------------------------------------------------------------
-- 2. FALLAS MÁS FRECUENTES (RANKING DE CLASES DIAGNÓSTICAS)
-- -----------------------------------------------------------------------------
SELECT 
    falla_predicha,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje_del_total,
    ROUND(AVG(confianza) * 100, 2) AS promedio_confianza_pct,
    ROUND(MIN(confianza) * 100, 2) AS confianza_min_pct,
    ROUND(MAX(confianza) * 100, 2) AS confianza_max_pct
FROM predicciones
GROUP BY falla_predicha
ORDER BY cantidad DESC;

-- -----------------------------------------------------------------------------
-- 3. DIAGNÓSTICOS POR TIPO DE EQUIPO (LAPTOP VS. DESKTOP)
-- -----------------------------------------------------------------------------
SELECT 
    tipo_equipo,
    COUNT(*) AS total_equipos,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS participacion_pct,
    ROUND(AVG(antiguedad_anios), 1) AS promedio_antiguedad_anios,
    ROUND(AVG(confianza) * 100, 2) AS promedio_confianza_pct
FROM predicciones
GROUP BY tipo_equipo
ORDER BY total_equipos DESC;

-- -----------------------------------------------------------------------------
-- 4. MATRIZ DE FALLAS PREDICHAS POR MARCA
-- -----------------------------------------------------------------------------
SELECT 
    marca,
    falla_predicha,
    COUNT(*) AS total_casos,
    ROUND(AVG(confianza) * 100, 2) AS confianza_media_pct
FROM predicciones
GROUP BY marca, falla_predicha
ORDER BY total_casos DESC, marca ASC;

-- -----------------------------------------------------------------------------
-- 5. EVOLUCIÓN TEMPORAL DE CONSULTAS PREDICTIVAS
-- -----------------------------------------------------------------------------
SELECT 
    CAST(fecha_consulta AS DATE) AS fecha,
    COUNT(*) AS diagnosticos_del_dia,
    COUNT(DISTINCT marca) AS marcas_atendidas,
    ROUND(AVG(confianza) * 100, 2) AS confianza_media_diaria_pct
FROM predicciones
GROUP BY CAST(fecha_consulta AS DATE)
ORDER BY fecha DESC;

-- -----------------------------------------------------------------------------
-- 6. PROMEDIO DE CONFIANZA POR CATEGORÍA DE CERTEZA
-- -----------------------------------------------------------------------------
SELECT 
    CASE 
        WHEN confianza >= 0.70 THEN 'Alta (>= 70%)'
        WHEN confianza >= 0.45 THEN 'Media (45% - 69%)'
        ELSE 'Baja (< 45%)'
    END AS segmento_certeza,
    COUNT(*) AS cantidad_predicciones,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje_distribucion,
    ROUND(AVG(confianza) * 100, 2) AS confianza_promedio_pct
FROM predicciones
GROUP BY 
    CASE 
        WHEN confianza >= 0.70 THEN 'Alta (>= 70%)'
        WHEN confianza >= 0.45 THEN 'Media (45% - 69%)'
        ELSE 'Baja (< 45%)'
    END
ORDER BY confianza_promedio_pct DESC;

-- -----------------------------------------------------------------------------
-- 7. AUDITORÍA DE ÚLTIMAS 10 PREDICCIONES CON DETALLE TOP 3
-- -----------------------------------------------------------------------------
SELECT 
    id,
    fecha_consulta,
    tipo_equipo,
    marca,
    antiguedad_anios,
    SUBSTRING(sintoma FROM 1 FOR 60) AS sintoma_resumido,
    falla_predicha,
    ROUND(confianza * 100, 1) || '%' AS confianza,
    top1_falla || ' (' || ROUND(top1_confianza * 100, 1) || '%)' AS top_1,
    top2_falla || ' (' || ROUND(top2_confianza * 100, 1) || '%)' AS top_2,
    top3_falla || ' (' || ROUND(top3_confianza * 100, 1) || '%)' AS top_3
FROM predicciones
ORDER BY fecha_consulta DESC
LIMIT 10;
