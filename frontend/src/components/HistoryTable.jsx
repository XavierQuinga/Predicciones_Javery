import React, { useEffect, useState } from 'react';

const TRADUCCION_CLASES = {
  'Power/battery': 'Alimentación, Batería o Circuito de Carga',
  'System board': 'Placa Base / Tarjeta Madre / Chipset',
  'Integrated screen': 'Pantalla Integrada / Flex de Video / Panel LCD',
  'Internal storage': 'Unidad de Almacenamiento (Disco HDD / SSD)',
  Boot: 'Secuencia de Arranque / Master Boot Record / UEFI',
  'Operating system': 'Sistema Operativo (Windows / Controladores)',
  Performance: 'Rendimiento Lento, Congelamiento o Saturación',
  Overheating: 'Sobrecalentamiento Térmico / Disipador o Ventilador',
  'Integrated keyboard': 'Teclado Integrado / Teclas Dañadas',
  'Integrated pointing device': 'Touchpad / Dispositivo Puntero',
  'Ports/slots/connectors': 'Puertos, Ranuras o Conectores (USB, HDMI, Jack)',
  'Virus/malware': 'Infección por Virus / Malware',
  Configuration: 'Configuración de Sistema, BIOS o Controladores',
  'Internal damage': 'Daño Físico Interno / Golpe o Líquido',
  'Case/chassis': 'Carcasa, Chasis o Bisagras',
  'Integrated media component': 'Componente Multimedia (Cámara / Audio)',
  'Integrated optical drive': 'Unidad Óptica / Lectora',
  Multiple: 'Múltiples Fallas Combinadas',
  Other: 'Otro / Falla Atípica'
};

export default function HistoryTable({ onSelectPrediction }) {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [tipoEquipo, setTipoEquipo] = useState('');
  const [falla, setFalla] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });
      if (search.trim()) params.append('search', search.trim());
      if (tipoEquipo) params.append('tipo_equipo', tipoEquipo);
      if (falla) params.append('falla', falla);

      const res = await fetch(`/api/predictions?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar el historial');
      const data = await res.json();
      setPredictions(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, pageSize, tipoEquipo, falla]);

  useEffect(() => {
    if (!selectedRecord) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setSelectedRecord(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedRecord]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const openDetail = (record) => {
    setSelectedRecord(record);
    if (onSelectPrediction) onSelectPrediction(record);
  };

  const getBadgeClass = (conf) => {
    if (conf >= 0.50) return 'badge-alta';
    if (conf >= 0.32) return 'badge-media';
    return 'badge-baja';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section className="history-view" aria-labelledby="history-title">
      <div className="history-header">
        <div>
          <div className="history-eyebrow">
            <i className="fi fi-rr-database" aria-hidden="true" />
            <span>Repositorio central</span>
            <span className="history-count">{total} registros</span>
          </div>
          <h2 id="history-title">Historial de diagnósticos</h2>
          <p>Consulta, filtra y revisa cada inferencia registrada en PostgreSQL.</p>
        </div>

        <button type="button" className="history-btn history-btn-secondary" onClick={fetchHistory} disabled={isLoading}>
          <i className={`fi fi-rr-refresh ${isLoading ? 'history-spin' : ''}`} aria-hidden="true" />
          <span>{isLoading ? 'Actualizando…' : 'Actualizar'}</span>
        </button>
      </div>

      <div className="history-filter-panel">
        <form className="history-search" onSubmit={handleSearchSubmit}>
          <i className="fi fi-rr-search" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por marca, síntoma o diagnóstico…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="history-btn history-btn-primary">Buscar</button>
        </form>

        <select value={tipoEquipo} onChange={(event) => { setTipoEquipo(event.target.value); setPage(1); }}>
          <option value="">Todos los equipos</option>
          <option value="laptop">Laptops / Portátiles</option>
          <option value="desktop">Desktops / Escritorio</option>
        </select>

        <select value={falla} onChange={(event) => { setFalla(event.target.value); setPage(1); }}>
          <option value="">Todas las fallas</option>
          {Object.entries(TRADUCCION_CLASES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y hora</th>
              <th>Equipo</th>
              <th>Marca</th>
              <th>Síntoma reportado</th>
              <th>Diagnóstico</th>
              <th>Confianza</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" className="history-empty">Cargando registros históricos…</td></tr>
            ) : predictions.length === 0 ? (
              <tr><td colSpan="8" className="history-empty">No se encontraron diagnósticos con los filtros seleccionados.</td></tr>
            ) : predictions.map((record) => {
              const nombreEs = TRADUCCION_CLASES[record.falla_predicha] || record.falla_predicha;
              return (
                <tr key={record.id}>
                  <td className="history-id">#{record.id}</td>
                  <td className="history-date">{formatDate(record.fecha_consulta)}</td>
                  <td><span className="history-device"><i className="fi fi-rr-laptop" aria-hidden="true" />{record.tipo_equipo}</span></td>
                  <td className="history-strong">{record.marca}</td>
                  <td><span className="history-symptom" title={record.sintoma}>{record.sintoma}</span></td>
                  <td>
                    <div className="history-diagnosis">{nombreEs}</div>
                    <small>CompCat: {record.falla_predicha}</small>
                  </td>
                  <td><span className={`badge ${getBadgeClass(record.confianza)}`}>{record.porcentaje_confianza}%</span></td>
                  <td>
                    <button type="button" className="history-btn history-btn-detail" onClick={() => openDetail(record)}>
                      <i className="fi fi-rr-eye" aria-hidden="true" />
                      <span>Detalle</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="history-pagination">
        <span>Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> · {total} registros</span>
        <div>
          <button type="button" className="history-btn history-btn-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            <i className="fi fi-rr-angle-left" aria-hidden="true" />
            Anterior
          </button>
          <button type="button" className="history-btn history-btn-secondary" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Siguiente
            <i className="fi fi-rr-angle-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {selectedRecord && (
        <div className="history-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <div className="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-detail-title">
            <div className="history-modal-header">
              <div>
                <span className="history-record-badge">Registro #{selectedRecord.id}</span>
                <h3 id="history-detail-title">Detalle técnico del diagnóstico</h3>
              </div>
              <button type="button" className="history-close" aria-label="Cerrar detalle" onClick={() => setSelectedRecord(null)}>
                <i className="fi fi-rr-cross-small" aria-hidden="true" />
              </button>
            </div>

            <div className="history-detail-hero">
              <span>Falla diagnosticada por el modelo</span>
              <h4>{TRADUCCION_CLASES[selectedRecord.falla_predicha] || selectedRecord.falla_predicha}</h4>
              <p>CompCat: <strong>{selectedRecord.falla_predicha}</strong></p>
              <div><span className={`badge ${getBadgeClass(selectedRecord.confianza)}`}>Confianza: {selectedRecord.porcentaje_confianza}%</span></div>
            </div>

            {selectedRecord.top3?.length > 0 && (
              <div className="history-detail-section">
                <h4>Top 3 de probabilidades</h4>
                <div className="history-top3">
                  {selectedRecord.top3.map((item, index) => (
                    <div className={index === 0 ? 'active' : ''} key={`${item.falla}-${index}`}>
                      <span><strong>{index + 1}</strong>{TRADUCCION_CLASES[item.falla] || item.falla}</span>
                      <b>{item.porcentaje}%</b>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="history-detail-grid">
              <div><span>Tipo de equipo</span><strong>{selectedRecord.tipo_equipo}</strong></div>
              <div><span>Marca</span><strong>{selectedRecord.marca}</strong></div>
              <div><span>Antigüedad</span><strong>{selectedRecord.antiguedad_anios !== null ? `${selectedRecord.antiguedad_anios} años` : 'Imputada (6.0 años)'}</strong></div>
              <div><span>Origen de datos</span><strong>{selectedRecord.origen_registro}</strong></div>
            </div>

            <div className="history-detail-section">
              <h4>Descripción completa del síntoma</h4>
              <blockquote>“{selectedRecord.sintoma}”</blockquote>
            </div>

            <div className="history-modal-footer">
              <button type="button" className="history-btn history-btn-primary" onClick={() => setSelectedRecord(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
