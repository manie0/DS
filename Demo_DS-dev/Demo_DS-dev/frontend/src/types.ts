/** Tipos de alerta que puede generar el sistema Observer */
export type AlertType =
  | 'NIVEL_BAJO'
  | 'NIVEL_CRITICO'
  | 'NIVEL_ALTO'
  | 'LLENO'
  | 'POSIBLE_FUGA'
  | 'NORMAL';

/** Alerta persistida en la base de datos */
export interface Alert {
  id: number;
  tankId: number;
  alertType: AlertType;
  currentLevel: number;
  percentage: number;
  threshold: number;
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
  tank?: { name: string; location?: string };
}

/** Datos del formulario de evaluación */
export interface EvaluateForm {
  tankId: string;
  levelLiters: string;
  percentage: string;
  temperatureC: string;
  previousLevelLiters: string;
  minutesSinceLastReading: string;
}

/** Filtros del listado */
export interface AlertFilters {
  tankId: string;
  alertType: string;
  resolved: string; // 'all' | 'true' | 'false'
}
