import {
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
  onINP,
  type Metric,
} from 'web-vitals';
import { report, getConfig } from './reporter';
import type { WebVitalsMetric } from './types';

function transformMetric(metric: Metric): WebVitalsMetric {
  let rating: WebVitalsMetric['rating'] = 'good';

  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[metric.name];
  if (threshold) {
    if (metric.value > threshold.poor) {
      rating = 'poor';
    } else if (metric.value > threshold.good) {
      rating = 'needs-improvement';
    }
  }

  return {
    name: metric.name,
    value: metric.value,
    rating,
    delta: metric.delta,
    entries: metric.entries as PerformanceEntry[],
    id: metric.id,
    navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
  };
}

export function initWebVitals() {
  const config = getConfig();
  if (!config.enableWebVitals) return;

  const reportMetric = (metric: Metric) => {
    report(transformMetric(metric));
  };

  onCLS(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
}
