import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getPlatformMetrics() {
    const now = Date.now();
    return {
      activeExperiments: 1,
      totalExperiments: 5,
      totalSensorEvents: 2_850_000 + Math.floor(Math.random() * 10000),
      avgPowerConsumption: +(342 + Math.random() * 20 - 10).toFixed(0),
      aiOptimizationSavings: 22.1,
      safetyAlertsToday: 3,
      uptime: 99.94,
      hardwareOnline: true,
      kafkaLag: Math.floor(Math.random() * 200),
      lastUpdated: new Date().toISOString(),
    };
  }

  getPowerTimeSeries(experimentId?: string, points = 60) {
    const now = Date.now();
    return Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now - (points - i) * 60000).toISOString(),
      baseline: 412 + Math.sin(i * 0.2) * 30 + (Math.random() - 0.5) * 20,
      aiOptimized: 320 + Math.sin(i * 0.2) * 24 + (Math.random() - 0.5) * 15,
    }));
  }

  getTelemetryAggregates(experimentId: string, windowMinutes = 60) {
    const noise = () => (Math.random() - 0.5) * 0.05;
    return {
      experimentId, windowMinutes,
      flux:         { min: 1.72, max: 2.28, mean: 1.82 + noise(), stddev: 0.14 },
      temperature:  { min: 48.2, max: 61.8, mean: 52.4 + noise(), stddev: 3.1 },
      displacement: { min: 12.1, max: 19.8, mean: 14.6 + noise(), stddev: 1.8 },
      powerW:       { min: 310.0, max: 380.0, mean: 342.0 + noise() * 10, stddev: 18.4 },
    };
  }

  getSensorDistribution() {
    return [
      { name: 'Hall-Effect', count: 38, pct: 38 },
      { name: 'Flux Density', count: 29, pct: 29 },
      { name: 'Thermal', count: 18, pct: 18 },
      { name: 'Accelerometer', count: 15, pct: 15 },
    ];
  }

  getExperimentComparison() {
    return [
      { id: 'exp-001', name: 'Alpha-7', baseline: 412, aiOptimized: 321, stability: 94.7, aiEnabled: true },
      { id: 'exp-002', name: 'Grid B',  baseline: 487, aiOptimized: 487, stability: 78.2, aiEnabled: false },
      { id: 'exp-005', name: 'Freq Sweep', baseline: 280, aiOptimized: 218, stability: 88.1, aiEnabled: true },
    ];
  }
}
