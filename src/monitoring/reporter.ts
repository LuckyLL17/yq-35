import type { MonitorConfig, ReportData } from './types';

let config: Required<MonitorConfig> = {
  enableWebVitals: true,
  enableErrorMonitor: true,
  appId: '',
  userId: '',
  reportUrl: '',
  sampleRate: 1,
  debug: false,
};

export function initReporter(userConfig: MonitorConfig) {
  config = { ...config, ...userConfig };
}

export function getConfig() {
  return config;
}

export function report(data: ReportData) {
  if (Math.random() > config.sampleRate) return;

  if (config.debug) {
    console.log('[Monitor]', data);
  }

  if (config.reportUrl) {
    sendToServer(data);
  }
}

function sendToServer(data: ReportData) {
  const payload = {
    ...data,
    appId: config.appId,
    userId: config.userId,
    timestamp: Date.now(),
    pageUrl: window.location.href,
  };

  if (typeof navigator.sendBeacon === 'function' && config.reportUrl) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(config.reportUrl, blob);
  } else if (config.reportUrl) {
    fetch(config.reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}
