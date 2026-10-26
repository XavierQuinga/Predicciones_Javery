import React, { useEffect, useState } from 'react';

const TRADUCCION_CLASES = {
  'Power/battery': 'Alimentación, batería o circuito de carga',
  'System board': 'Placa base / tarjeta madre / chipset',
  'Integrated screen': 'Pantalla integrada / flex de video / panel LCD',
  'Internal storage': 'Unidad de almacenamiento HDD / SSD',
  'Boot': 'Secuencia de arranque / UEFI',
  'Operating system': 'Sistema operativo',
  'Performance': 'Rendimiento lento, congelamiento o saturación',
  'Overheating': 'Sobrecalentamiento térmico',
  'Integrated keyboard': 'Teclado integrado',
  'Integrated pointing device': 'Touchpad / dispositivo puntero',
  'Ports/slots/connectors': 'Puertos, ranuras o conectores',
  'Virus/malware': 'Virus / malware',
  'Configuration': 'Configuración de sistema / BIOS',
  'Internal damage': 'Daño físico interno',
  'Case/chassis': 'Carcasa / chasis / bisagras',
  'Integrated media component': 'Componente multimedia',
  'Integrated optical drive': 'Unidad óptica',
  'Multiple': 'Múltiples fallas combinadas',
  'Other': 'Otro / falla atípica'
};

export default function ModelInfo() {
  const [modelInfo, setModelInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('metricas');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/model/info')
      .then((res) => res.json())
      .then((data) => setModelInfo(data))
      .catch((error) => console.error('Error al cargar información del modelo:', error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="analytics-panel analytics-loading">Cargando información del modelo...</div>;
  }

  const metricas = modelInfo?.metricas_mejor_modelo || {};
  const comparativa = modelInfo?.comparativa_algoritmos || [];
  const metricasClase = modelInfo?.metricas_por_clase || [];
  const clases = modelInfo?.clases || [];

  const metricValue = (value, fallback) => value != null ? `${(value * 100).toFixed(2)}%` : fallback;

  return (
    <div className="analytics-view model-info-clean">
      <section className="analytics-hero model-hero">
        <div className="analytics-hero-main">
          <div className="analytics-icon analytics-icon-blue"><i className="fi fi-rr-settings" /></div>
          <div>
            <div className="analytics-eyebrow">MODELO SELECCIONADO · F1 MACRO</div>
            <h2>Random Forest Classifier</h2>
            <p>Pipeline CompCat · 2,866 casos · validación cruzada estratificada de 3 folds.</p>
          </div>
        </div>
        <span className="model-badge">Modelo ganador</span>
      </section>

      <section className="analytics-panel model-tabs-panel">
        <div className="analytics-tabs model-tabs">
          <button type="button" className={activeTab === 'metricas' ? 'active' : ''} onClick={() => setActiveTab('metricas')}>
            Métricas & algoritmos
          </button>
          <button type="button" className={activeTab === 'clases' ? 'active' : ''} onClick={() => setActiveTab('clases')}>
            19 clases diagnósticas
          </button>
          <button type="button" className={activeTab === 'leakage' ? 'active' : ''} onClick={() => setActiveTab('leakage')}>
            Auditoría & data leakage
          </button>
        </div>
      </section>

      <section className="analytics-kpi-grid model-metrics-grid">
        <article className="analytics-kpi metric-blue">
          <div className="analytics-kpi-label">CV F1 Macro</div>
          <div className="analytics-kpi-value">{metricValue(metricas.cv_f1_macro_media, '61.95%')}</div>
          <div className="analytics-kpi-note">Criterio principal · 3-fold stratified</div>
        </article>
        <article className="analytics-kpi metric-green">
          <div className="analytics-kpi-label">Test Accuracy</div>
          <div className="analytics-kpi-value">{metricValue(metricas.test_accuracy, '71.60%')}</div>
          <div className="analytics-kpi-note">574 casos del conjunto de prueba</div>
        </article>
        <article className="analytics-kpi metric-purple">
          <div className="analytics-kpi-label">ROC-AUC Macro</div>
          <div className="analytics-kpi-value">{metricValue(metricas.test_roc_auc_macro_ovr, '92.69%')}</div>
          <div className="analytics-kpi-note">One-vs-Rest multiclase</div>
        </article>
        <article className="analytics-kpi metric-amber">
          <div className="analytics-kpi-label">Precision Macro</div>
          <div className="analytics-kpi-value">{metricValue(metricas.test_precision_macro, '64.63%')}</div>
          <div className="analytics-kpi-note">Evaluación equilibrada por clase</div>
        </article>
      </section>

      {activeTab === 'metricas' && (
        <section className="analytics-panel">
          <div className="analytics-section-heading">
            <div>
              <div className="analytics-eyebrow">COMPARACIÓN EXPERIMENTAL</div>
              <h3>Matriz comparativa de los algoritmos evaluados</h3>
            </div>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table model-table">
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Modelo</th>
                  <th>CV F1 Macro</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 Macro</th>
                  <th>ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {comparativa.map((item, index) => {
                  const winner = item.Modelo === 'Random_Forest';
                  return (
                    <tr key={`${item.Modelo}-${index}`} className={winner ? 'model-winner-row' : ''}>
                      <td><strong>{index + 1}°</strong></td>
                      <td><strong>{item.Modelo}</strong>{winner && <span className="model-inline-badge">Ganador</span>}</td>
                      <td><strong>{(item.CV_F1_macro_media * 100).toFixed(2)}%</strong></td>
                      <td>{(item.Test_Accuracy * 100).toFixed(2)}%</td>
                      <td>{(item.Test_Precision_macro * 100).toFixed(2)}%</td>
                      <td>{(item.Test_Recall_macro * 100).toFixed(2)}%</td>
                      <td>{(item.Test_F1_macro * 100).toFixed(2)}%</td>
                      <td>{item.Test_ROC_AUC_macro_OVR ? `${(item.Test_ROC_AUC_macro_OVR * 100).toFixed(2)}%` : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'clases' && (
        <section className="analytics-panel">
          <div className="analytics-section-heading">
            <div>
              <div className="analytics-eyebrow">TAXONOMÍA COMPCAT</div>
              <h3>19 clases predictivas</h3>
            </div>
          </div>

          <div className="model-class-grid">
            {clases.map((item, index) => (
              <article className="model-class-card" key={`${item}-${index}`}>
                <span className="model-class-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{TRADUCCION_CLASES[item] || item}</strong>
                  <small>{item}</small>
                </div>
              </article>
            ))}
          </div>

          {!!metricasClase.length && (
            <div className="analytics-table-wrap model-class-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Falla</th>
                    <th>Precisión</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  {metricasClase.map((row, index) => (
                    <tr key={`${row.Tipo_Falla}-${index}`}>
                      <td><strong>{TRADUCCION_CLASES[row.Tipo_Falla] || row.Tipo_Falla}</strong><small className="model-table-sub">{row.Tipo_Falla}</small></td>
                      <td>{(row.precision * 100).toFixed(1)}%</td>
                      <td>{(row.recall * 100).toFixed(1)}%</td>
                      <td><strong>{(row['f1-score'] * 100).toFixed(1)}%</strong></td>
                      <td>{row.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'leakage' && (
        <section className="analytics-panel">
          <div className="analytics-section-heading">
            <div>
              <div className="analytics-eyebrow">AUDITORÍA DEL PIPELINE</div>
              <h3>Calidad de datos y riesgos metodológicos</h3>
            </div>
          </div>

          <div className="model-audit-grid">
            <article className="model-audit-card audit-success">
              <div className="model-audit-icon"><i className="fi fi-rr-shield-check" /></div>
              <div><h4>Prevención de data leakage</h4><p>Se excluyeron del entrenamiento las variables generadas después del diagnóstico, como componente dañado, solución, tiempos, costo y estado.</p></div>
            </article>

            <article className="model-audit-card audit-warning">
              <div className="model-audit-icon"><i className="fi fi-rr-language" /></div>
              <div><h4>Desfase lingüístico</h4><p>El corpus internacional contiene principalmente inglés y alemán, mientras los casos operativos de JAVERY se reciben en español. Este punto debe considerarse al interpretar las predicciones.</p></div>
            </article>

            <article className="model-audit-card audit-info">
              <div className="model-audit-icon"><i className="fi fi-rr-settings" /></div>
              <div><h4>Pipeline reproducible</h4><p>El artefacto integra TF-IDF, One-Hot Encoder e imputación numérica por mediana junto con el clasificador Random Forest serializado.</p></div>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
