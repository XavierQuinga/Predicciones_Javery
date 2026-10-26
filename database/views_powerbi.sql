-- =============================================================================
-- VISTA SQL PARA POWER BI: SISTEMA PREDICTIVO DE DIAGNÓSTICO JAVERY
-- Diseñada para importación directa o DirectQuery sin necesidad de transformaciones
-- complejas en Power Query.
-- =============================================================================

CREATE OR REPLACE VIEW vw_powerbi_predicciones AS
SELECT
    p.id AS id_prediccion,
    p.fecha_consulta,
    CAST(p.fecha_consulta AS DATE) AS fecha,
    EXTRACT(YEAR FROM p.fecha_consulta)::INT AS anio,
    EXTRACT(MONTH FROM p.fecha_consulta)::INT AS mes,
    TO_CHAR(p.fecha_consulta, 'TMMonth') AS nombre_mes,
    EXTRACT(DAY FROM p.fecha_consulta)::INT AS dia,
    TO_CHAR(p.fecha_consulta, 'TMDay') AS dia_semana,
    EXTRACT(HOUR FROM p.fecha_consulta)::INT AS hora,
    
    -- Variables de Hardware del Equipo
    p.tipo_equipo,
    INITCAP(p.tipo_equipo) AS tipo_equipo_label,
    p.marca,
    p.antiguedad_anios,
    CASE 
        WHEN p.antiguedad_anios IS NULL THEN 'No especificada'
        WHEN p.antiguedad_anios <= 2 THEN '0 a 2 años (Reciente)'
        WHEN p.antiguedad_anios <= 5 THEN '3 a 5 años (Medio)'
        WHEN p.antiguedad_anios <= 8 THEN '6 a 8 años (Maduro)'
        ELSE 'Más de 8 años (Antiguo)'
    END AS rango_antiguedad,
    
    -- Síntoma y Diagnóstico Predictivo
    p.sintoma,
    p.falla_predicha,
    p.confianza,
    ROUND(p.confianza * 100, 2) AS porcentaje_confianza,
    CASE 
        WHEN p.confianza >= 0.70 THEN 'Alta Certeza (>= 70%)'
        WHEN p.confianza >= 0.45 THEN 'Certeza Moderada (45% - 69%)'
        ELSE 'Baja Certeza (< 45%)'
    END AS nivel_certeza,
    
    -- Desglose de Probabilidades Top 3
    p.top1_falla,
    ROUND(p.top1_confianza * 100, 2) AS top1_porcentaje,
    p.top2_falla,
    ROUND(p.top2_confianza * 100, 2) AS top2_porcentaje,
    p.top3_falla,
    ROUND(p.top3_confianza * 100, 2) AS top3_porcentaje,
    
    -- Metadatos del Modelo y Trazabilidad
    p.modelo_utilizado,
    p.version_modelo,
    p.origen_registro,
    CASE 
        WHEN p.origen_registro = 'PREDICCION_SISTEMA' THEN 'Predicción Web en Vivo'
        ELSE 'Registro Histórico / Validación'
    END AS tipo_origen_label
FROM predicciones p;

COMMENT ON VIEW vw_powerbi_predicciones IS 'Vista unificada y normalizada para consumo por dashboards de Microsoft Power BI.';
