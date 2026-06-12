import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

/**
 * ChartProviderService — Centralized lazy loader for Chart.js.
 *
 * Ensures Chart.js is loaded and registered exactly once, shared across
 * all chart components. Replaces the duplicated module-level dynamic
 * imports that existed in each chart component.
 */
@Injectable({ providedIn: 'root' })
export class ChartProviderService {
  private chartReady = signal(false);
  private chartPromise: Promise<typeof import('chart.js')> | null = null;

  /**
   * Lazy-load Chart.js and register all components.
   * Returns the same promise on every call — single load, shared across app.
   */
  async ensureChart(): Promise<typeof import('chart.js')> {
    if (!this.chartPromise) {
      this.chartPromise = import('chart.js').then(m => {
        m.Chart.register(...m.registerables);
        this.chartReady.set(true);
        return m;
      });
    }
    return this.chartPromise;
  }

  /**
   * Synchronous check — true after ensureChart() has resolved.
   */
  isReady(): boolean {
    return this.chartReady();
  }
}
