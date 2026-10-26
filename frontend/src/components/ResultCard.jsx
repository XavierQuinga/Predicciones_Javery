import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  History, 
  ExternalLink,
  Laptop, 
  Calendar,
  Layers,
  Database,
  BarChart2,
  BarChart3,
  Cpu,
  ShieldCheck,
  Award,
  Sparkles,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

const PROTOCOLOS_TALLER = {
  "Internal storage": [
    "Verificar detección de la unidad SATA / NVMe en BIOS/UEFI.",
    "Extraer la unidad y realizar diagnóstico SMART de sectores defectuosos (CrystalDisk / Victoria).",
    "Comprobar cable de datos, conector flex o puerto M.2 por sulfatación.",
    "Probar inicio del equipo mediante unidad externa USB Live (Hirens / Linux)."
  ],
  "Boot": [
    "Comprobar orden de arranque (Boot Priority) en configuración BIOS/UEFI.",
    "Verificar estado de partición EFI y Master Boot Record (MBR).",
    "Ejecutar herramientas de recuperación de arranque (bootrec /fixmbr, /fixboot, /rebuildbcd).",
    "Descartar corrupción del archivo BCD o de controladores de almacenamiento."
  ],
  "Power/battery": [
    "Medir voltaje de salida del cargador con multímetro (19V / 20V continuos bajo carga).",
    "Inspeccionar centro de carga (DC Jack) por soldadura fría o pin central quebrado.",
    "Desconectar batería interna y probar encendido directo únicamente con alimentación AC.",
    "Verificar fusibles térmicos de entrada y MOSFETs de conmutación en placa base."
  ],
  "Integrated screen": [
    "Conectar monitor externo vía HDMI/DisplayPort para descartar daño en chip gráfico GPU.",
    "Inspeccionar cable flex de video e inverter en la bisagra por pinzamiento o desgaste.",
    "Probar iluminación del panel con linterna en ángulo para descartar fallo del backlight / LED.",
    "Revisar voltaje de alimentación del panel LCD (3.3V y 19V en conector EDP)."
  ],
  "System board": [
    "Contar secuencia de pitidos de error (Beep Codes) o parpadeos LED de diagnóstico.",
    "Retirar módulos de memoria RAM, limpiar contactos con alcohol isopropílico y probar uno a uno.",
    "Verificar capacitores SMD y líneas de 3.3V / 5V / 12V en búsqueda de cortocircuito a tierra.",
    "Realizar reseteo de CMOS / BIOS retirando la pila de respaldo por 5 minutos."
  ],
  "Overheating": [
    "Desarmar sistema térmico, limpiar conductos del disipador de cobre y pelusa del ventilador.",
    "Reemplazar pasta térmica seca por compuesto de alta conductividad (>= 8 W/mK) y thermal pads.",
    "Comprobar giro libre del ventilador y lubricar buje o reemplazar ventilador si emite zumbido.",
    "Monitorear curvas RPM del ventilador en BIOS y descartar bloqueo por suciedad."
  ],
  "Operating system": [
    "Iniciar en modo seguro de Windows y desinstalar actualizaciones o controladores recientes.",
    "Ejecutar comprobación de integridad con sfc /scannow y DISM /RestoreHealth.",
    "Revisar visor de eventos (Event Viewer) para aislar el código BSOD o controlador causante.",
    "Analizar consumo en segundo plano y estado de servicios de inicio."
  ],
  "Performance": [
    "Monitorear uso de disco y CPU al 100% en Administrador de Tareas (posible SSD degradado).",
    "Evaluar capacidad de memoria RAM instalada frente a la demanda del usuario (ampliación sugerida).",
    "Limpiar archivos temporales, bloatware y procesos residentes no deseados.",
    "Comprobar salud térmica; el thermal throttling reduce la frecuencia del procesador."
  ]
};

export default function ResultCard({ 
  result, 
  onReset, 
  onGoToHistory, 
  onGoToPowerBi 
}) {
  if (!result) return null;

  const {
    prediction_id,
    falla_predicha,
    falla_predicha_es,
    confianza,
    porcentaje_confianza,
    top3 = [],
    detalles_equipo = {},
    fecha_consulta,
    modelo_utilizado,
    version_modelo,
    mensaje_confianza,
    dominance_ratio,
    top2_acumulada,
    total_clases_evaluadas = 19,
    azar_base_porcentaje = 5.26
  } = result;

  // En un clasificador de 19 clases (azar base = 5.26%):
  // 40% es más de 7.5 veces superior al azar y representa la clase dominante.
  const getBadgeConfig = (conf) => {
    if (conf >= 0.50) {
      return {
        className: 'badge-alta',
        label: 'Alta Certeza Diagnóstica',
        color: '#10b981',
        glow: '0 0 25px rgba(16, 185, 129, 0.25)'
      };
    }
    if (conf >= 0.32) {
      return {
        className: 'badge-alta',
        label: 'Certeza Sólida / Clase Dominante',
        color: '#06b6d4',
        glow: '0 0 25px rgba(6, 182, 212, 0.25)'
      };
    }
    if (conf >= 0.20) {
      return {
        className: 'badge-media',
        label: 'Certeza Moderada (Top 2 Concentrado)',
        color: '#f59e0b',
        glow: '0 0 25px rgba(245, 158, 11, 0.25)'
      };
    }
    return {
      className: 'badge-media',
      label: 'Diagnóstico Multiclase',
      color: '#a78bfa',
      glow: '0 0 20px rgba(167, 139, 250, 0.2)'
    };
  };

  const badgeInfo = getBadgeConfig(confianza);
  const ratioCalculado = dominance_ratio || (confianza / (azar_base_porcentaje / 100)).toFixed(1);
  const top2Calculado = top2_acumulada || (top3.length >= 2 ? (top3[0].porcentaje + top3[1].porcentaje).toFixed(1) : porcentaje_confianza);
  const protocolos = PROTOCOLOS_TALLER[falla_predicha] || [
    "Inspeccionar conectores principales y verificar alimentación.",
    "Comprobar componentes primarios según la sintomatología descrita.",
    "Consultar las alternativas del Top 3 en caso de no hallar anomalía física."
  ];

  return (
    <div className="dashboard-grid-2col" style={{ width: '100%' }}>
      
      {/* =========================================================================
          COLUMNA IZQUIERDA: HERO DEL DIAGNÓSTICO + HARDWARE + ACCIONES
          ========================================================================= */}
      <div className="column-stack">
        
        {/* Tarjeta Principal de la Falla Diagnosticada */}
        <div 
          className="glass-card" 
          style={{ 
            border: `1px solid ${badgeInfo.color}66`, 
            boxShadow: badgeInfo.glow,
            position: 'relative'
          }}
        >
          {/* Encabezado Superior con Identificadores */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid var(--border-subtle)', 
            paddingBottom: '1rem', 
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">
                <Sparkles size={13} />
                <span>Diagnóstico Exitoso</span>
              </span>
              {prediction_id && (
                <span className="badge badge-alta">
                  <Database size={12} />
                  <span>PostgreSQL #{prediction_id}</span>
                </span>
              )}
            </div>

            <div className={`badge ${badgeInfo.className}`} style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', borderColor: badgeInfo.color, color: badgeInfo.color }}>
              <BarChart2 size={15} />
              <span>{porcentaje_confianza}% • {badgeInfo.label}</span>
            </div>
          </div>

          {/* Subtítulo de Falla */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ 
              fontSize: '0.78rem', 
              color: 'var(--accent-blue-light)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              fontWeight: 700 
            }}>
              Falla Principal Diagnosticada
            </span>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              Taxonomía CompCat
            </span>
          </div>

          {/* Nombre en Español destacado */}
          <div style={{ 
            fontSize: '1.95rem', 
            fontWeight: 800, 
            color: '#ffffff', 
            fontFamily: 'var(--font-display)', 
            lineHeight: 1.2,
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em'
          }}>
            {falla_predicha_es || falla_predicha}
          </div>

          {/* Equivalencia en CompCat */}
          {falla_predicha_es && falla_predicha_es !== falla_predicha && (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Categoría técnica Open Repair: <strong style={{ color: 'var(--accent-cyan-light)' }}>{falla_predicha}</strong>
            </div>
          )}

          {/* Barra de Progreso HUD */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Probabilidad asignada por ensamble (200 estimadores)</span>
              <strong style={{ color: badgeInfo.color, fontSize: '0.98rem' }}>{porcentaje_confianza}%</strong>
            </div>
            <div style={{ background: 'rgba(10, 15, 29, 0.85)', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ 
                width: `${Math.min(100, Math.max(8, porcentaje_confianza))}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, #2563eb 0%, ${badgeInfo.color} 100%)`,
                borderRadius: 'var(--radius-full)',
                boxShadow: `0 0 14px ${badgeInfo.color}`,
                transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
              }}></div>
            </div>
          </div>

          {/* Métricas Estadísticas de Dominancia Multiclase */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem', 
            marginBottom: '1.15rem' 
          }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.8)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <TrendingUp size={20} color="var(--accent-cyan-light)" />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>
                  Dominancia sobre el Azar
                </span>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                  {ratioCalculado}x superior
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Base 19 clases: {azar_base_porcentaje}%
                </span>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(15, 23, 42, 0.8)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <Layers size={20} color="var(--accent-blue-light)" />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase' }}>
                  Certeza Acumulada Top 2
                </span>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                  {top2Calculado}%
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Concentración en subsistema afín
                </span>
              </div>
            </div>
          </div>

          {/* Interpretación Clínica del Modelo */}
          <p style={{ 
            fontSize: '0.84rem', 
            color: 'var(--text-secondary)', 
            fontStyle: 'italic', 
            padding: '0.75rem 1rem',
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: `3px solid ${badgeInfo.color}`,
            lineHeight: 1.55
          }}>
            {mensaje_confianza}
          </p>
        </div>

        {/* Resumen de las Variables Evaluadas (Hardware Specs) */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.95rem' }}>
            <Cpu size={18} color="var(--accent-blue-light)" />
            <h4 style={{ fontSize: '0.96rem', color: '#fff' }}>Especificaciones de Entrada Evaluadas</h4>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.85rem' 
          }}>
            <div style={{ background: 'rgba(10, 15, 29, 0.7)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Tipo de Equipo
              </span>
              <strong style={{ color: '#fff', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {detalles_equipo.tipo_equipo}
              </strong>
            </div>

            <div style={{ background: 'rgba(10, 15, 29, 0.7)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Marca
              </span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                {detalles_equipo.marca}
              </strong>
            </div>

            <div style={{ background: 'rgba(10, 15, 29, 0.7)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Antigüedad
              </span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                {detalles_equipo.antiguedad_anios !== null ? `${detalles_equipo.antiguedad_anios} años` : 'Imputada (6.0 años)'}
              </strong>
            </div>

            <div style={{ background: 'rgba(10, 15, 29, 0.7)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Pipeline Predictivo
              </span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                {modelo_utilizado} v{version_modelo}
              </strong>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.85rem', 
          justifyContent: 'space-between'
        }}>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onReset}
            style={{ flex: '1 1 auto' }}
          >
            <RotateCcw size={16} />
            <span>Nueva Predicción</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onGoToHistory}
            style={{ flex: '1 1 auto' }}
          >
            <History size={16} />
            <span>Ver en Historial Central</span>
          </button>

          <button 
            type="button" 
            className="btn btn-amber"
            onClick={onGoToPowerBi}
            style={{ flex: '1 1 auto' }}
          >
            <BarChart3 size={16} />
            <span>Dashboard Power BI</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          COLUMNA DERECHA: TOP 3 BREAKDOWN + PROTOCOLO DE TALLER + RADAR
          ========================================================================= */}
      <div className="column-stack">
        
        {/* Desglose del Top 3 de Probabilidades */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Layers size={18} color="var(--accent-blue-light)" />
              <span>Top 3 Alternativas Más Probables</span>
            </h4>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              Ensamble de 200 árboles
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {top3.map((item, index) => {
              const isFirst = index === 0;
              return (
                <div 
                  key={index}
                  style={{ 
                    background: isFirst ? 'rgba(30, 58, 138, 0.3)' : 'rgba(15, 23, 42, 0.75)', 
                    padding: '0.9rem 1.15rem', 
                    borderRadius: 'var(--radius-md)',
                    border: isFirst ? `1px solid ${badgeInfo.color}88` : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        background: isFirst ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.08)', 
                        color: '#fff', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.78rem', 
                        fontWeight: 800 
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isFirst ? '#fff' : 'var(--text-primary)' }}>
                          {item.falla_es || item.falla}
                        </div>
                        {item.falla_es && item.falla_es !== item.falla && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            CompCat: {item.falla}
                          </div>
                        )}
                      </div>
                    </div>

                    <strong style={{ 
                      fontWeight: 800, 
                      fontSize: '1.05rem', 
                      color: isFirst ? badgeInfo.color : 'var(--text-muted)',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {item.porcentaje}%
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.06)', height: '7px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${item.porcentaje}%`, 
                      height: '100%', 
                      background: isFirst ? `linear-gradient(90deg, #2563eb 0%, ${badgeInfo.color} 100%)` : 'rgba(148, 163, 184, 0.4)',
                      borderRadius: 'var(--radius-full)'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protocolo de Inspección Física Recomendado para Taller */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <CheckSquare size={18} color="var(--accent-emerald-light)" />
            <h4 style={{ fontSize: '1rem', color: '#fff' }}>Protocolo de Taller Recomendado</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.95rem' }}>
            Pasos técnicos prioritarios para validar la causa física en el laboratorio de JAVERY:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {protocolos.map((paso, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.65rem',
                  fontSize: '0.84rem',
                  background: 'rgba(10, 15, 29, 0.75)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  lineHeight: 1.5
                }}
              >
                <span style={{ 
                  color: 'var(--accent-emerald-light)', 
                  fontWeight: 800, 
                  fontSize: '0.8rem', 
                  background: 'rgba(16, 185, 129, 0.15)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <span style={{ color: '#e2e8f0' }}>{paso}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guía Metodológica de Certeza Multiclase */}
        <div className="glass-card" style={{ padding: '1.25rem 1.4rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={16} color="var(--accent-blue-light)" />
            <h5 style={{ fontSize: '0.88rem', color: '#fff' }}>Nota para el Tribunal de Titulación</h5>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Al clasificar simultáneamente entre <strong>19 clases mutuamente excluyentes</strong>, una probabilidad del <strong>{porcentaje_confianza}%</strong> representa un consenso dominante (<strong>{ratioCalculado}x superior al 5.26% del azar puro</strong>), respaldado por la métrica de generalización ROC-AUC Macro del 92.69%.
          </p>
        </div>

      </div>

    </div>
  );
}
