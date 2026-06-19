/**
 * FtEChartComponent — Reusable ECharts wrapper component.
 *
 * Provides a unified interface for all chart types with:
 * - `options` input: ECharts configuration object
 * - `loading` input: Show loading skeleton
 * - `height` input: Container height (default: '250px')
 * - `chartReady` output: Emits ECharts instance on init
 * - ng-content slots for loading, empty, and error states
 *
 * Uses OnPush change detection and lazy ECharts initialization.
 * Handles responsive resize via ResizeObserver.
 */

import {
  Component,
  input,
  output,
  signal,
  ViewChild,
  ContentChild,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterContentInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { EChartsOption, ECharts } from 'echarts';

/** ECharts state machine */
export type EChartState = 'loading' | 'empty' | 'error' | 'ready';

@Component({
  selector: 'ft-echart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ft-echart-container" [style.height]="height()">
      @if (_state() === 'loading') {
        <ng-content select="[loading]" />
        @if (!_hasLoadingContent()) {
          <div class="ft-echart-skeleton">
            <div class="ft-echart-skeleton-bar"></div>
          </div>
        }
      } @else if (_state() === 'empty') {
        <ng-content select="[empty]" />
        @if (!_hasEmptyContent()) {
          <div class="ft-echart-empty">
            <span>No data available</span>
          </div>
        }
      } @else if (_state() === 'error') {
        <ng-content select="[error]" />
        @if (!_hasErrorContent()) {
          <div class="ft-echart-error">
            <span>Error loading chart</span>
            <button class="ft-echart-retry" (click)="retry()" type="button">
              Retry
            </button>
          </div>
        }
      } @else {
        <div #chartContainer class="ft-echart-canvas"></div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .ft-echart-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .ft-echart-canvas {
      width: 100%;
      height: 100%;
    }

    .ft-echart-skeleton {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      animation: ft-echart-pulse 1.5s ease-in-out infinite;
    }

    .ft-echart-skeleton-bar {
      width: 60%;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.04) 25%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.04) 75%
      );
      background-size: 200% 100%;
      animation: ft-echart-shimmer 1.5s ease-in-out infinite;
    }

    .ft-echart-empty,
    .ft-echart-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 8px;
      color: var(--text-tertiary, rgba(243, 232, 255, 0.4));
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }

    .ft-echart-error {
      color: var(--danger, #FF6B6B);
    }

    .ft-echart-retry {
      margin-top: 8px;
      padding: 6px 16px;
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
      border-radius: 8px;
      background: var(--bg-tertiary, #2A1E35);
      color: var(--text-primary, #F3E8FF);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: all 200ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .ft-echart-retry:hover {
      background: var(--bg-secondary, #1D1426);
      border-color: var(--accent-primary, #9D50BB);
    }

    @keyframes ft-echart-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes ft-echart-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FtEChartComponent implements OnInit, OnDestroy, OnChanges, AfterContentInit {
  // ─── Inputs ──────────────────────────────────────────────────────────────

  /** ECharts configuration options */
  options = input<EChartsOption | undefined>(undefined);

  /** Force loading state */
  loading = input<boolean>(false);

  /** Container height */
  height = input<string>('250px');

  // ─── Outputs ─────────────────────────────────────────────────────────────

  /** Emits the ECharts instance when initialization completes */
  chartReady = output<ECharts>();

  /** Emits when an error occurs */
  chartError = output<Error>();

  // ─── State ───────────────────────────────────────────────────────────────

  /** Current chart state */
  readonly state = output<EChartState>();
  readonly _state = signal<EChartState>('loading');

  // ─── Internal ────────────────────────────────────────────────────────────

  @ViewChild('chartContainer') private containerRef!: ElementRef<HTMLDivElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private chartInstance: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private echartsImport: typeof import('echarts') | null = null;

  /** Detect if user provided custom slot content */
  private hasLoadingContent = false;
  private hasEmptyContent = false;
  private hasErrorContent = false;

  // Query projected content to detect if user provided custom slots
  @ContentChild('[loading]', { read: ElementRef }) private loadingSlot?: ElementRef;
  @ContentChild('[empty]', { read: ElementRef }) private emptySlot?: ElementRef;
  @ContentChild('[error]', { read: ElementRef }) private errorSlot?: ElementRef;

  /** Expose content detection flags for the template */
  readonly _hasLoadingContent = signal(false);
  readonly _hasEmptyContent = signal(false);
  readonly _hasErrorContent = signal(false);

  constructor() {
    // Sync internal state to output
    effect(() => {
      this.state.emit(this._state());
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.loading()) {
      this._state.set('loading');
      return;
    }

    this.initChart();
  }

  ngAfterContentInit(): void {
    // Detect projected ng-content slots and update signals
    this._hasLoadingContent.set(!!this.loadingSlot);
    this._hasEmptyContent.set(!!this.emptySlot);
    this._hasErrorContent.set(!!this.errorSlot);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (changes['loading'] && this.loading()) {
      this._state.set('loading');
      return;
    }

    if (changes['options'] && this.chartInstance) {
      const opts = this.options();
      if (opts) {
        this.updateChart(opts);
      } else {
        this._state.set('empty');
      }
    }
  }

  ngOnDestroy(): void {
    this.disposeChart();
  }

  /** Retry chart initialization after error */
  retry(): void {
    this._state.set('loading');
    this.disposeChart();
    this.initChart();
  }

  /** Get the raw ECharts instance (for external resize calls) */
  getInstance(): ECharts | null {
    return this.chartInstance;
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private async initChart(): Promise<void> {
    try {
      // Lazy load ECharts
      if (!this.echartsImport) {
        this.echartsImport = await import('echarts');
      }

      const opts = this.options();

      // Check for empty data
      if (!opts || this.isEmptyOptions(opts)) {
        this._state.set('empty');
        return;
      }

      if (!this.containerRef) {
        this._state.set('error');
        return;
      }

      // Initialize chart
      const echarts = this.echartsImport;
      this.chartInstance = echarts.init(this.containerRef.nativeElement);

      this.chartInstance.setOption(opts);

      // Setup resize observer
      this.setupResizeObserver();

      this._state.set('ready');
      this.chartReady.emit(this.chartInstance);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[FtEChartComponent] Failed to initialize chart:', error);
      this._state.set('error');
      this.chartError.emit(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private updateChart(opts: EChartsOption): void {
    if (!this.chartInstance) return;

    if (this.isEmptyOptions(opts)) {
      this._state.set('empty');
      this.disposeChart();
      return;
    }

    this.chartInstance.setOption(opts, { notMerge: false });
    this._state.set('ready');
  }

  private isEmptyOptions(opts: EChartsOption): boolean {
    const series = (opts as Record<string, unknown>)['series'];
    if (!series) return true;
    if (Array.isArray(series)) {
      return series.length === 0 || series.every((s: Record<string, unknown>) => {
        const data = s['data'] as unknown[] | undefined;
        return !data || data.length === 0;
      });
    }
    return false;
  }

  private setupResizeObserver(): void {
    if (!this.containerRef || typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.chartInstance?.resize();
    });

    this.resizeObserver.observe(this.containerRef.nativeElement);
    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  private disposeChart(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
