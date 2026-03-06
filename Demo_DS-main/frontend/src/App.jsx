import { useEffect, useMemo, useState } from 'react';

const defaultConfig = {
  siteName: '',
  sampleRateSeconds: 10,
  alertThresholdPercent: 80,
  calibrationOffset: 0,
};

const apiBase = import.meta.env.VITE_API_URL ?? '/api';

async function parseError(response) {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
    }
  } catch {
    // ignore JSON parsing errors and fallback below
  }
  return `HTTP ${response.status} ${response.statusText}`;
}

export function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${apiBase}/singleton/config`, [apiBase]);

  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      setConfig({
        siteName: data.siteName ?? '',
        sampleRateSeconds: data.sampleRateSeconds ?? 10,
        alertThresholdPercent: data.alertThresholdPercent ?? 80,
        calibrationOffset: data.calibrationOffset ?? 0,
      });
      setMessage('Configuración cargada correctamente.');
    } catch (fetchError) {
      const fallback = `No se pudo conectar con la API (${apiBase}). Si usas Docker, revisa el proxy /api del frontend.`;
      setError(fetchError instanceof Error ? `${fetchError.message}. ${fallback}` : fallback);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: config.siteName,
          sampleRateSeconds: Number(config.sampleRateSeconds),
          alertThresholdPercent: Number(config.alertThresholdPercent),
          calibrationOffset: Number(config.calibrationOffset),
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      setConfig({
        siteName: data.siteName,
        sampleRateSeconds: data.sampleRateSeconds,
        alertThresholdPercent: data.alertThresholdPercent,
        calibrationOffset: data.calibrationOffset,
      });
      setMessage('Configuración actualizada.');
    } catch (saveError) {
      const fallback = `No se pudo conectar con la API (${apiBase}).`;
      setError(saveError instanceof Error ? `${saveError.message}. ${fallback}` : fallback);
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${endpoint}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = await response.json();
      setConfig({
        siteName: data.siteName,
        sampleRateSeconds: data.sampleRateSeconds,
        alertThresholdPercent: data.alertThresholdPercent,
        calibrationOffset: data.calibrationOffset,
      });
      setMessage('Configuración reiniciada a valores por defecto.');
    } catch (resetError) {
      const fallback = `No se pudo conectar con la API (${apiBase}).`;
      setError(resetError instanceof Error ? `${resetError.message}. ${fallback}` : fallback);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [endpoint]);

  return (
    <main className="layout">
      <section className="card">
        <h1>Singleton: Configuración Global</h1>
        <p className="subtitle">Módulo Lecturas y Alertas de Tanques</p>
        <p className="api">API: {apiBase}</p>

        <form onSubmit={updateConfig} className="form">
          <label>
            Sitio / Planta
            <input
              value={config.siteName}
              onChange={(event) => setConfig((prev) => ({ ...prev, siteName: event.target.value }))}
              placeholder="Tanques Planta Norte"
              required
            />
          </label>

          <label>
            Frecuencia de muestreo (seg)
            <input
              type="number"
              min={1}
              max={100}
              value={config.sampleRateSeconds}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, sampleRateSeconds: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Umbral de alerta (%)
            <input
              type="number"
              min={0}
              max={100}
              value={config.alertThresholdPercent}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, alertThresholdPercent: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Offset de calibración
            <input
              type="number"
              min={-10}
              max={10}
              step="0.1"
              value={config.calibrationOffset}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, calibrationOffset: event.target.value }))
              }
              required
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={saving || loading}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={resetConfig} disabled={saving || loading} className="secondary">
              Reset singleton
            </button>
            <button type="button" onClick={fetchConfig} disabled={saving || loading} className="ghost">
              Recargar
            </button>
          </div>
        </form>

        {loading && <p className="hint">Cargando configuración...</p>}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
