import React, { useState } from 'react';

const SUGERENCIAS_RAPIDAS = [
  'No enciende al presionar el botón de encendido',
  'La pantalla parpadea y muestra líneas horizontales',
  'Sobrecalienta excesivamente y el ventilador suena fuerte',
  'El sistema operativo se congela y tarda mucho en arrancar',
  'La batería no retiene carga o se descarga en minutos',
  'No detecta la unidad de almacenamiento interno (disco)',
  'Derramamiento de líquido y varias teclas no funcionan'
];

const MARCAS_POPULARES = ['HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Apple', 'Toshiba', 'Samsung'];

export default function PredictionForm({ features, onSubmit, isLoading, error }) {
  const [tipoEquipo, setTipoEquipo] = useState('laptop');
  const [marca, setMarca] = useState('HP');
  const [customMarca, setCustomMarca] = useState('');
  const [isOtherMarca, setIsOtherMarca] = useState(false);
  const [antiguedadAnios, setAntiguedadAnios] = useState(5.0);
  const [useDefaultAge, setUseDefaultAge] = useState(false);
  const [sintoma, setSintoma] = useState('');

  const marcasList = features?.marcas || ['HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Apple', 'Toshiba', 'Samsung', 'Sin marca'];
  const ejemplos = features?.ejemplos_sintomas || [];

  const handleMarcaChange = (val) => {
    if (val === '__OTRA__') {
      setIsOtherMarca(true);
      setMarca(customMarca || 'Sin marca');
      return;
    }
    setIsOtherMarca(false);
    setMarca(val);
  };

  const handleCustomMarcaChange = (e) => {
    const val = e.target.value;
    setCustomMarca(val);
    setMarca(val || 'Sin marca');
  };

  const handleApplyExample = (ejemplo) => {
    setTipoEquipo(ejemplo.tipo_equipo);
    if (marcasList.includes(ejemplo.marca)) {
      setMarca(ejemplo.marca);
      setIsOtherMarca(false);
    } else {
      setIsOtherMarca(true);
      setCustomMarca(ejemplo.marca);
      setMarca(ejemplo.marca);
    }
    if (ejemplo.antiguedad_anios !== null && ejemplo.antiguedad_anios !== undefined) {
      setAntiguedadAnios(ejemplo.antiguedad_anios);
      setUseDefaultAge(false);
    } else {
      setUseDefaultAge(true);
    }
    setSintoma(ejemplo.sintoma);
  };

  const handleAppendSymptom = (text) => {
    setSintoma((prev) => prev.trim() ? `${prev.trim()}, ${text.toLowerCase()}` : text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sintoma.trim() || sintoma.trim().length < 3) {
      alert('Por favor ingrese una descripción del síntoma de al menos 3 caracteres.');
      return;
    }

    onSubmit({
      tipo_equipo: tipoEquipo,
      marca: marca || 'Sin marca',
      antiguedad_anios: useDefaultAge ? null : parseFloat(antiguedadAnios),
      sintoma: sintoma.trim()
    });
  };

  return (
    <div className="dashboard-grid-2col" style={{ width: '100%' }}>
      <div className="glass-card" style={{ width: '100%' }}>
        <div className="card-header-styled">
          <div className="card-header-icon">
            <i className="fi fi-rr-tool-box" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Diagnóstico Predictivo de Recepción</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Ingrese las variables recolectadas al recibir el equipo para ejecutar la inferencia con Random Forest.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.9rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.88rem'
          }}>
            <i className="fi fi-rr-triangle-warning error-icon" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">
                <i className="fi fi-rr-laptop" aria-hidden="true" />
                <span>Tipo de Equipo Informático *</span>
              </label>

              <div className="segmented-picker" role="radiogroup" aria-label="Selecciona tipo de equipo">
                <div
                  className={`segmented-option ${tipoEquipo === 'laptop' ? 'active' : ''}`}
                  onClick={() => setTipoEquipo('laptop')}
                  role="radio"
                  aria-checked={tipoEquipo === 'laptop'}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setTipoEquipo('laptop'); }}
                >
                  <div className="segmented-icon">
                    <i className="fi fi-rr-laptop" aria-hidden="true" />
                  </div>
                  <div className="segmented-text">
                    <span className="segmented-title">Laptop / Portátil</span>
                    <span className="segmented-subtitle">Equipos móviles: pantalla integrada, teclado, batería y flex</span>
                  </div>
                </div>

                <div
                  className={`segmented-option ${tipoEquipo === 'desktop' ? 'active' : ''}`}
                  onClick={() => setTipoEquipo('desktop')}
                  role="radio"
                  aria-checked={tipoEquipo === 'desktop'}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setTipoEquipo('desktop'); }}
                >
                  <div className="segmented-icon">
                    <i className="fi fi-rr-computer" aria-hidden="true" />
                  </div>
                  <div className="segmented-text">
                    <span className="segmented-title">Desktop / Escritorio</span>
                    <span className="segmented-subtitle">Torres y All-in-One: fuente de poder ATX, PCIe y placa madre</span>
                  </div>
                </div>
              </div>
              <span className="form-hint">Clasificación canónica según el corpus internacional CompCat.</span>
            </div>

            <div className="form-group form-full">
              <label className="form-label" htmlFor="select-marca-dropdown">
                <i className="fi fi-rr-brand-badge" aria-hidden="true" />
                <span>Marca / Fabricante del Equipo *</span>
              </label>

              <div className="brand-chips-grid">
                {MARCAS_POPULARES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`brand-chip ${marca === m && !isOtherMarca ? 'active' : ''}`}
                    onClick={() => handleMarcaChange(m)}
                  >
                    {m}
                  </button>
                ))}
                <button
                  type="button"
                  className={`brand-chip ${isOtherMarca ? 'active' : ''}`}
                  onClick={() => handleMarcaChange('__OTRA__')}
                >
                  + Otra marca...
                </button>
              </div>

              {!isOtherMarca ? (
                <select
                  id="select-marca-dropdown"
                  className="form-select"
                  value={marca}
                  onChange={(e) => handleMarcaChange(e.target.value)}
                  required
                >
                  {marcasList.map((m) => <option key={m} value={m}>{m}</option>)}
                  <option value="__OTRA__">+ Otra marca no listada...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Escriba el fabricante (ej: Huawei, MSI, Sony, Razer)..."
                    value={customMarca}
                    onChange={handleCustomMarcaChange}
                    style={{ flex: 1 }}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setIsOtherMarca(false); setMarca('HP'); }}
                  >
                    Volver a lista
                  </button>
                </div>
              )}
              <span className="form-hint">
                El pipeline procesa la marca mediante codificación One-Hot con tolerancia a marcas no observadas (`handle_unknown='ignore'`).
              </span>
            </div>

            <div className="form-group form-full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label className="form-label" htmlFor="input-antiguedad-slider">
                  <i className="fi fi-rr-calendar" aria-hidden="true" />
                  <span>Antigüedad del Equipo (Años)</span>
                </label>

                <label style={{
                  fontSize: '0.8rem',
                  color: useDefaultAge ? 'var(--ui-blue)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  background: '#f8fafc',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <input
                    type="checkbox"
                    checked={useDefaultAge}
                    onChange={(e) => setUseDefaultAge(e.target.checked)}
                  />
                  <span>Desconocida (Imputar Mediana = 6.0 años)</span>
                </label>
              </div>

              {!useDefaultAge ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem' }}>
                  <input
                    id="input-antiguedad-slider"
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={antiguedadAnios}
                    onChange={(e) => setAntiguedadAnios(parseFloat(e.target.value))}
                    style={{ flex: 1, height: '8px', borderRadius: '4px', cursor: 'pointer' }}
                    aria-label="Antigüedad en años"
                  />
                  <div className="hud-counter">
                    {antiguedadAnios.toFixed(1)} {antiguedadAnios === 1 ? 'año' : 'años'}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#eff6ff',
                  border: '1px dashed #bfdbfe',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#1d4ed8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <i className="fi fi-rr-lightbulb-on info-icon" aria-hidden="true" />
                  <span>El imputador de Scikit-Learn asignará automáticamente la mediana estadística: <strong>6.0 años</strong>.</span>
                </div>
              )}
            </div>

            <div className="form-group form-full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="textarea-sintoma-input">
                  <i className="fi fi-rr-document" aria-hidden="true" />
                  <span>Síntoma / Problema Técnico Observado *</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: sintoma.length < 3 ? 'var(--text-muted)' : 'var(--accent-emerald-light)' }}>
                  {sintoma.length} caracteres
                </span>
              </div>

              <textarea
                id="textarea-sintoma-input"
                className="form-textarea"
                placeholder="Describa el comportamiento anómalo que presenta el equipo (ej: 'no enciende, la pantalla permanece negra y el cargador parpadea intermitente')..."
                value={sintoma}
                onChange={(e) => setSintoma(e.target.value)}
                required
              />
              <span className="form-hint">
                El modelo TF-IDF evalúa n-gramas de caracteres (3 a 5), reconociendo variaciones de escritura y modismos técnicos.
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              id="btn-predict"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.05rem', fontSize: '1.08rem', letterSpacing: '0.03em' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="status-indicator animate-spin" style={{ background: '#fff', width: '14px', height: '14px' }} />
                  <span>EJECUTANDO INFERENCIA EN MODELO RANDOM FOREST...</span>
                </>
              ) : (
                <>
                  <i className="fi fi-rr-lightbulb-on" aria-hidden="true" />
                  <span>PREDECIR FALLA CON INTELIGENCIA ARTIFICIAL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="column-stack">
        {ejemplos.length > 0 && (
          <div className="glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <i className="fi fi-rr-time-quarter-past section-icon" aria-hidden="true" />
              <h3 style={{ fontSize: '1.05rem' }}>Casos de Prueba Rápida</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Selecciona un escenario típico para autocompletar el formulario y probar la inferencia:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {ejemplos.map((ej, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyExample(ej)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    padding: '0.8rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    textAlign: 'left',
                    fontFamily: 'inherit'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#111827', display: 'block' }}>{ej.titulo}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ej.marca} • {ej.tipo_equipo} • {ej.antiguedad_anios ?? 's/d'} años
                    </span>
                  </div>
                  <i className="fi fi-rr-angle-small-right quick-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <i className="fi fi-rr-document section-icon" aria-hidden="true" />
            <h4 style={{ fontSize: '0.95rem' }}>Insertar Frases de Diagnóstico</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Haz clic en una frase para añadirla a la descripción:
          </p>

          <div className="symptom-pills">
            {SUGERENCIAS_RAPIDAS.map((sug, i) => (
              <button key={i} type="button" className="symptom-pill" onClick={() => handleAppendSymptom(sug)}>
                + {sug}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.3rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <i className="fi fi-rr-database-management section-icon" aria-hidden="true" />
            <h4 style={{ fontSize: '0.92rem' }}>Pipeline de Machine Learning (JAVERY)</h4>
          </div>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.65 }}>
            <li><strong>Clasificador:</strong> Random Forest (200 árboles de decisión, F1 Macro 61.95%).</li>
            <li><strong>Procesamiento NLP:</strong> TF-IDF con n-gramas de caracteres (3 a 5) + One-Hot 90 marcas.</li>
            <li><strong>Aislamiento de Fuga:</strong> Exclusión estricta de variables posteriores al diagnóstico (0% data leakage).</li>
            <li><strong>Taxonomía:</strong> 19 clases canónicas del estándar internacional Open Repair.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
