export interface MonitorConfig {
  enableWebVitals?: boolean;
  enableErrorMonitor?: boolean;
  appId?: string;
  userId?: string;
  reportUrl?: string;
  sampleRate?: number;
  debug?: boolean;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
}

export interface JSErrorInfo {
  type: 'js-error';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface ResourceErrorInfo {
  type: 'resource-error';
  tagName: string;
  src?: string;
  href?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PromiseRejectionInfo {
  type: 'promise-rejection';
  reason: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export type ErrorInfo = JSErrorInfo | ResourceErrorInfo | PromiseRejectionInfo;

export type ReportData = WebVitalsMetric | ErrorInfo;
