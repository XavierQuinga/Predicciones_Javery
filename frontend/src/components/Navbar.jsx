import React from 'react';

export default function Navbar({ activeTab, setActiveTab, systemStatus }) {
  const isConnecting = systemStatus === null;
  const isHealthy = systemStatus?.status === 'healthy';
  const isUnavailable = !isConnecting && !isHealthy;

  const statusConfig = isHealthy
    ? {
        label: 'Inferencia & DB Activos',
        color: '#10b981',
        title: 'Pipeline de Inferencia Random Forest y Base de Datos en línea'
      }
    : isUnavailable
      ? {
          label: 'Backend no disponible',
          color: '#ef4444',
          title: 'El frontend no puede comunicarse con el backend de inferencia en este momento'
        }
      : {
          label: 'Conectando...',
          color: '#f59e0b',
          title: 'Conectando con backend...'
        };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <div className="brand-wrapper">
          <div className="brand-logo" aria-hidden="true">
            <i className="fi fi-rr-tool-box" />
          </div>
          <div className="brand-titles">
            <h1>Sistema Predictivo de Diagnóstico de Fallas</h1>
            <p>
              <span>Inteligencia Artificial para Hardware & Software</span>
              <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>JAVERY</span>
            </p>
          </div>
        </div>

        <nav className="nav-links" aria-label="Navegación principal">
          <button
            id="tab-prediction"
            type="button"
            className={`nav-item ${activeTab === 'prediction' ? 'active' : ''}`}
            onClick={() => setActiveTab('prediction')}
            aria-current={activeTab === 'prediction' ? 'page' : undefined}
          >
            <i className="fi fi-rr-document-gear" aria-hidden="true" />
            <span>Nueva Predicción</span>
          </button>

          <button
            id="tab-history"
            type="button"
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            <i className="fi fi-rr-time-quarter-past" aria-hidden="true" />
            <span>Historial</span>
          </button>

          <button
            id="tab-powerbi"
            type="button"
            className={`nav-item ${activeTab === 'powerbi' ? 'active' : ''}`}
            onClick={() => setActiveTab('powerbi')}
            aria-current={activeTab === 'powerbi' ? 'page' : undefined}
          >
            <i className="fi fi-rr-chart-pie" aria-hidden="true" />
            <span>Dashboard & Power BI</span>
          </button>

          <button
            id="tab-model"
            type="button"
            className={`nav-item ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
            aria-current={activeTab === 'model' ? 'page' : undefined}
          >
            <i className="fi fi-rr-settings" aria-hidden="true" />
            <span>Información del Modelo</span>
          </button>
        </nav>

        <div
          className="status-pill"
          title={statusConfig.title}
          aria-live="polite"
        >
          <div className="status-radar">
            <span
              className={`status-indicator ${isHealthy ? 'pulse' : ''}`}
              style={{ background: statusConfig.color }}
            />
          </div>
          <span>{statusConfig.label}</span>
        </div>
      </div>
    </header>
  );
}
