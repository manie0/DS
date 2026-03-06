import type { Alert, AlertFilters } from './types';

const BASE = '';  // Vite proxy redirige /alerts y /setup al backend

/** Obtiene las alertas activas (resolved = false) */
export async function fetchActiveAlerts(): Promise<Alert[]> {
  const res = await fetch(`${BASE}/alerts/active`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Alert[]>;
}

/** Obtiene todas las alertas con filtros opcionales */
export async function fetchAlerts(filters: AlertFilters): Promise<Alert[]> {
  const params = new URLSearchParams();
  if (filters.tankId)   params.set('tankId',    filters.tankId);
  if (filters.alertType && filters.alertType !== 'all') params.set('alertType', filters.alertType);
  if (filters.resolved  && filters.resolved  !== 'all') params.set('resolved',  filters.resolved);

  const qs = params.toString();
  const res = await fetch(`${BASE}/alerts${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Alert[]>;
}

/** Evalúa una lectura de sensor y retorna las alertas generadas */
export async function evaluateReading(body: Record<string, number>): Promise<Alert[]> {
  const res = await fetch(`${BASE}/alerts/evaluate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message: string }).message ?? res.statusText);
  }
  return res.json() as Promise<Alert[]>;
}

/** Marca una alerta como resuelta */
export async function resolveAlert(id: number): Promise<Alert> {
  const res = await fetch(`${BASE}/alerts/${id}/resolve`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Alert>;
}
