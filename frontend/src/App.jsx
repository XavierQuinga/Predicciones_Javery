import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';
import ModelInfo from './components/ModelInfo';
import PowerBiView from './components/PowerBiView';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary detectó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card" style={{ maxWidth: '620px', margin: '2.5rem auto', textAlign: 'center', padding: '2.5rem' }}>
          <i className="fi fi-rr-triangle-warning error-icon" style={{ fontSize: '46px', margin: '0 auto 1.25rem' }} aria-hidden="true" />
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.35rem' }}>Ocurrió un problema en la interfaz</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {this.state.error?.message || 'Error inesperado al renderizar el componente visual.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            <i className="fi fi-rr-refresh" aria-hidden="true" />
            <span>Recargar Página</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const parseApiResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get('content-type') || '';
  let payload = null;

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch (error) {
      console.error('No se pudo interpretar la respuesta JSON:', error);
    }
  } else {
    const rawText = await response.text();
    console.error('Respuesta no JSON del backend:', response.status, rawText.slice(0, 250));
  }

  if (!response.ok) {
    if ([502, 503, 504].includes(response.status)) {
      throw new Error('El servicio de inferencia está temporalmente no disponible o reiniciándose. Intente nuevamente en unos segundos.');
    }

    throw new Error(
      payload?.detail ||
      payload?.message ||
      `${fallbackMessage} (HTTP ${response.status})`
    );
  }

  if (!payload) {
    throw new Error('El servidor respondió en un formato no válido. Recargue la página e intente nuevamente.');
  }

  return payload;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('prediction');
  const [systemStatus, setSystemStatus] = useState(null);
  const [features, setFeatures] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await parseApiResponse(response, 'No fue posible consultar el estado del sistema');
        if (!cancelled) setSystemStatus(data);
      } catch (err) {
        console.error('Error al consultar health:', err);
        if (!cancelled) setSystemStatus({ status: 'unavailable' });
      }
    };

    const loadFeatures = async () => {
      try {
        const response = await fetch('/api/model/features');
        const data = await parseApiResponse(response, 'No fue posible cargar las características del modelo');
        if (!cancelled) setFeatures(data);
      } catch (err) {
        console.error('Error al consultar features:', err);
        if (!cancelled) setFeatures(null);
      }
    };

    loadHealth();
    loadFeatures();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePredictionSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resultData = await parseApiResponse(
        response,
        'Error al procesar la predicción en el servidor'
      );

      setCurrentResult(resultData);
      setSystemStatus((prev) => prev?.status === 'healthy' ? prev : { status: 'healthy' });
    } catch (err) {
      console.error('Error en submit:', err);
      setError(err.message || 'Error inesperado al conectar con el backend de inferencia.');

      if (
        err.message?.includes('temporalmente no disponible') ||
        err.message?.includes('formato no válido')
      ) {
        setSystemStatus({ status: 'unavailable' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPrediction = () => {
    setCurrentResult(null);
    setError(null);
  };

  const handleGoToHistory = () => setActiveTab('history');
  const handleGoToPowerBi = () => setActiveTab('powerbi');

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      <main className="main-content">
        <ErrorBoundary>
          {activeTab === 'prediction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!currentResult ? (
                <PredictionForm
                  features={features}
                  onSubmit={handlePredictionSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <div className="result-view-clean">
                  <ResultCard
                    result={currentResult}
                    onReset={handleResetPrediction}
                    onGoToHistory={handleGoToHistory}
                    onGoToPowerBi={handleGoToPowerBi}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryTable onSelectPrediction={() => {}} />
          )}

          {activeTab === 'powerbi' && (
            <PowerBiView />
          )}

          {activeTab === 'model' && (
            <ModelInfo />
          )}
        </ErrorBoundary>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: '#ffffff',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <i className="fi fi-rr-award footer-icon" aria-hidden="true" />
            <span>Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos</span>
            <span style={{ color: 'var(--ui-blue)' }}>•</span>
            <span>Maestría en Herramientas Digitales para el Análisis de Datos e Inteligencia Artificial</span>
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Caso de estudio: JAVERY, Ingeniería Humana y Tecnológica • Quito, Ecuador • Machine Learning Pipeline (Random Forest v1.0.0)
          </p>
          <p className="flaticon-credit">
            Uicons by <a href="https://www.flaticon.com/uicons" target="_blank" rel="noreferrer noopener">Flaticon</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
