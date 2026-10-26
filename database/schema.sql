-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: SISTEMA PREDICTIVO DE DIAGNÓSTICO DE FALLAS EN TI
-- Caso de Estudio: JAVERY, Ingeniería Humana y Tecnológica – Quito, Ecuador
-- Motor: PostgreSQL 14+ / Azure Database for PostgreSQL Flexible Server
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA PRINCIPAL: PREDICCIONES
-- Registra cada consulta e inferencia realizada por el modelo de ML en tiempo real.
-- NOTA: porcentaje_confianza se almacena explícitamente desde la aplicación para
-- mantener compatibilidad entre PostgreSQL y el fallback SQLite.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predicciones (
    id BIGSERIAL PRIMARY KEY,
    fecha_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_equipo VARCHAR(50) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    antiguedad_anios NUMERIC(5, 2),
    sintoma TEXT NOT NULL,
    falla_predicha VARCHAR(100) NOT NULL,
    confianza NUMERIC(6, 4) NOT NULL,
    porcentaje_confianza NUMERIC(5, 2) NOT NULL,
    top1_falla VARCHAR(100),
    top1_confianza NUMERIC(6, 4),
    top2_falla VARCHAR(100),
    top2_confianza NUMERIC(6, 4),
    top3_falla VARCHAR(100),
    top3_confianza NUMERIC(6, 4),
    probabilidades JSONB,
    variables_entrada JSONB,
    modelo_utilizado VARCHAR(100) DEFAULT 'Random_Forest' NOT NULL,
    version_modelo VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
    origen_registro VARCHAR(50) DEFAULT 'PREDICCION_SISTEMA' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Comentarios explicativos para documentación de catálogo en PostgreSQL
COMMENT ON TABLE predicciones IS 'Almacén central operativo de inferencias predictivas emitidas por el modelo Random Forest para JAVERY y soporte a Power BI.';
COMMENT ON COLUMN predicciones.falla_predicha IS 'Clase diagnóstica predicha de entre las 19 categorías de la taxonomía CompCat.';
COMMENT ON COLUMN predicciones.confianza IS 'Probabilidad máxima asignada por el clasificador (0.0000 a 1.0000).';
COMMENT ON COLUMN predicciones.porcentaje_confianza IS 'Confianza expresada en porcentaje y persistida por la aplicación para compatibilidad PostgreSQL/SQLite.';
COMMENT ON COLUMN predicciones.origen_registro IS 'Diferenciador de fuente: PREDICCION_SISTEMA para nuevas consultas web, HISTORICO para registros iniciales.';

-- -----------------------------------------------------------------------------
-- 2. ÍNDICES ESTRATÉGICOS PARA CONSULTAS Y POWER BI
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_predicciones_fecha ON predicciones (fecha_consulta DESC);
CREATE INDEX IF NOT EXISTS idx_predicciones_falla ON predicciones (falla_predicha);
CREATE INDEX IF NOT EXISTS idx_predicciones_tipo_equipo ON predicciones (tipo_equipo);
CREATE INDEX IF NOT EXISTS idx_predicciones_marca ON predicciones (marca);
CREATE INDEX IF NOT EXISTS idx_predicciones_origen ON predicciones (origen_registro);
CREATE INDEX IF NOT EXISTS idx_predicciones_confianza ON predicciones (confianza);

-- -----------------------------------------------------------------------------
-- 3. DATOS SEMILLA INICIALES (Casos de referencia para validación y Power BI)
-- -----------------------------------------------------------------------------
INSERT INTO predicciones (
    fecha_consulta, tipo_equipo, marca, antiguedad_anios, sintoma,
    falla_predicha, confianza, porcentaje_confianza,
    top1_falla, top1_confianza, top2_falla, top2_confianza, top3_falla, top3_confianza,
    modelo_utilizado, version_modelo, origen_registro
) VALUES
(
    CURRENT_TIMESTAMP - INTERVAL '3 days', 'laptop', 'HP', 5.0,
    'blue screen on boot, laptop restarts continuously',
    'Integrated screen', 0.3900, 39.00,
    'Integrated screen', 0.3900, 'Boot', 0.3150, 'Operating system', 0.0700,
    'Random_Forest', '1.0.0', 'HISTORICO'
),
(
    CURRENT_TIMESTAMP - INTERVAL '2 days', 'desktop', 'Dell', 7.0,
    'No enciende, ventilador de la fuente no gira y no da ningún pitido',
    'Power/battery', 0.6250, 62.50,
    'Power/battery', 0.6250, 'System board', 0.2100, 'Configuration', 0.0650,
    'Random_Forest', '1.0.0', 'HISTORICO'
),
(
    CURRENT_TIMESTAMP - INTERVAL '1 day', 'laptop', 'Lenovo', 4.0,
    'Sobrecalentamiento extremo a los 10 minutos de uso y se apaga de golpe',
    'Overheating', 0.7420, 74.20,
    'Overheating', 0.7420, 'System board', 0.1200, 'Power/battery', 0.0540,
    'Random_Forest', '1.0.0', 'HISTORICO'
),
(
    CURRENT_TIMESTAMP - INTERVAL '4 hours', 'desktop', 'Sin marca', 8.0,
    'Al encender la computadora se queda en pantalla negra indicando no bootable device found',
    'Internal storage', 0.6890, 68.90,
    'Internal storage', 0.6890, 'Boot', 0.1850, 'Configuration', 0.0420,
    'Random_Forest', '1.0.0', 'HISTORICO'
)
ON CONFLICT DO NOTHING;
