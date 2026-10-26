import React, { useState } from 'react';

const POWER_BI_REPORT_URL = 'https://app.powerbi.com/groups/me/reports/b89434fb-aba9-4544-9b45-287cf6bb7ada/ResumenOperativo?experience=power-bi';

export default function PowerBiView() {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDashboard = () => {
    setIsLoading(true);
    setIframeKey((value) => value + 1);
  };

  const openFullscreen = () => {
    window.open('/dashboard-inteligente', '_blank', 'noopener,noreferrer');
  };

  const openPowerBi = () => {
    window.open(POWER_BI_REPORT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="analytics-view powerbi-browser-view">
      <section className="analytics-hero">
        <div className="analytics-hero-main">
          <div className="analytics-icon analytics-icon-blue" aria-hidden="true">
            <i className="fi fi-rr-chart-histogram" />
          </div>
          <div>
            <div className="analytics-eyebrow">DASHBOARD & POWER BI</div>
            <h2>Dashboard Inteligente · Versión Navegador</h2>
            <p>
              Vista web oficial del dashboard analítico del proyecto JAVERY, con gráficos, métricas del modelo,
              validación y datos operativos conectados al backend y PostgreSQL.
            </p>
          </div>
        </div>

        <div className="analytics-actions">
          <span className="analytics-live"><span /> Dashboard en línea</span>
          <button
            type="button"
            className="analytics-btn analytics-btn-secondary"
            onClick={refreshDashboard}
          >
            <i className="fi fi-rr-refresh" aria-hidden="true" />
            Recargar dashboard
          </button>
          <button
            type="button"
            className="analytics-btn analytics-btn-primary"
            onClick={openFullscreen}
          >
            <i className="fi fi-rr-expand" aria-hidden="true" />
            Pantalla completa
          </button>
          <button
            type="button"
            className="analytics-btn analytics-btn-primary"
            onClick={openPowerBi}
            title="Abrir el informe publicado en Microsoft Power BI"
          >
            <i className="fi fi-rr-chart-pie" aria-hidden="true" />
            Dashboard Power BI
          </button>
        </div>
      </section>

      <section className="analytics-panel analytics-dashboard-panel powerbi-browser-panel">
        <div className="powerbi-browser-toolbar">
          <div className="powerbi-browser-identity">
            <span className="powerbi-browser-dot" />
            <div>
              <strong>Dashboard Inteligente JAVERY</strong>
              <span>Resumen operativo · Evaluación del modelo · Validación JAVERY</span>
            </div>
          </div>
          <span className="powerbi-browser-badge">VERSIÓN WEB</span>
        </div>

        <div className="powerbi-browser-frame-wrap">
          {isLoading && (
            <div className="powerbi-browser-loading">
              <div className="powerbi-browser-spinner" />
              <strong>Cargando Dashboard Inteligente...</strong>
              <span>Conectando con FastAPI y PostgreSQL.</span>
            </div>
          )}

          <iframe
            key={iframeKey}
            src="/dashboard-inteligente"
            title="Dashboard Inteligente JAVERY - versión navegador"
            className="analytics-dashboard-frame powerbi-browser-frame"
            onLoad={() => setIsLoading(false)}
            allowFullScreen
          />
        </div>
      </section>

      <section className="analytics-panel powerbi-browser-info">
        <div className="analytics-section-heading">
          <div>
            <div className="analytics-eyebrow">CONTENIDO DEL DASHBOARD</div>
            <h3>Analítica incluida en la versión navegador</h3>
          </div>
        </div>

        <div className="powerbi-browser-features">
          <article>
            <i className="fi fi-rr-dashboard" aria-hidden="true" />
            <div><strong>Resumen operativo</strong><span>KPIs, equipos, marcas y consultas registradas.</span></div>
          </article>
          <article>
            <i className="fi fi-rr-chart-line-up" aria-hidden="true" />
            <div><strong>Evaluación del modelo</strong><span>Comparación de algoritmos, curva de aprendizaje y F1 por clase.</span></div>
          </article>
          <article>
            <i className="fi fi-rr-shield-check" aria-hidden="true" />
            <div><strong>Validación JAVERY</strong><span>Casos reales, resultados y análisis metodológico.</span></div>
          </article>
        </div>

        <p className="powerbi-browser-note">
          Esta es la <strong>versión web navegable del Dashboard Inteligente del proyecto</strong>. También puede abrir
          el informe publicado en Microsoft Power BI desde el botón superior, sin reemplazar esta experiencia integrada.
        </p>
      </section>
    </div>
  );
}
