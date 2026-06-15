import { report, getConfig } from './reporter';
import type {
  JSErrorInfo,
  ResourceErrorInfo,
  PromiseRejectionInfo,
} from './types';

function getBaseInfo() {
  return {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
}

function handleJSError(event: ErrorEvent) {
  if (event.error && event.error.stack) {
    const errorInfo: JSErrorInfo = {
      type: 'js-error',
      message: event.message,
      stack: event.error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      ...getBaseInfo(),
    };
    report(errorInfo);
  }
}

function handleResourceError(event: Event) {
  const target = event.target as HTMLElement;
  if (!target) return;

  const tagName = target.tagName?.toLowerCase() || '';

  if (['script', 'link', 'img', 'video', 'audio', 'iframe'].includes(tagName)) {
    const errorInfo: ResourceErrorInfo = {
      type: 'resource-error',
      tagName,
      src: (target as HTMLScriptElement | HTMLImageElement).src || undefined,
      href: (target as HTMLLinkElement).href || undefined,
      ...getBaseInfo(),
    };
    report(errorInfo);
  }
}

function handlePromiseRejection(event: PromiseRejectionEvent) {
  let reason = '';
  let stack: string | undefined;

  if (typeof event.reason === 'string') {
    reason = event.reason;
  } else if (event.reason instanceof Error) {
    reason = event.reason.message;
    stack = event.reason.stack;
  } else {
    try {
      reason = JSON.stringify(event.reason);
    } catch {
      reason = String(event.reason);
    }
  }

  const errorInfo: PromiseRejectionInfo = {
    type: 'promise-rejection',
    reason,
    stack,
    ...getBaseInfo(),
  };
  report(errorInfo);
}

export function initErrorMonitor() {
  const config = getConfig();
  if (!config.enableErrorMonitor) return;

  window.addEventListener('error', handleJSError, true);
  window.addEventListener('error', handleResourceError, true);
  window.addEventListener('unhandledrejection', handlePromiseRejection, true);
}

export function captureError(error: Error | string, extra?: Record<string, unknown>) {
  const baseInfo = getBaseInfo();

  if (typeof error === 'string') {
    const errorInfo: JSErrorInfo = {
      type: 'js-error',
      message: error,
      ...baseInfo,
    };
    report({ ...errorInfo, ...extra } as JSErrorInfo);
  } else {
    const errorInfo: JSErrorInfo = {
      type: 'js-error',
      message: error.message,
      stack: error.stack,
      ...baseInfo,
    };
    report({ ...errorInfo, ...extra } as JSErrorInfo);
  }
}
