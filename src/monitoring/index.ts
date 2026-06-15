import type { MonitorConfig } from './types';
import { initReporter, getConfig } from './reporter';
import { initWebVitals } from './webVitals';
import { initErrorMonitor, captureError } from './errorMonitor';

export * from './types';

let initialized = false;

export function initMonitor(config: MonitorConfig = {}) {
  if (initialized) return;
  initialized = true;

  initReporter(config);
  initWebVitals();
  initErrorMonitor();
}

export { getConfig, captureError };
