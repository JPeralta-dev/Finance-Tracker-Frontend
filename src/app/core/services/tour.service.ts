/**
 * FtTourService — onboarding tour engine.
 *
 * Responsibilities
 * ────────────────
 * - Owns the tour definition (5 onboarding steps for Flowr).
 * - Tracks active step via a signal.
 * - Persists state to localStorage so the tour resumes from the
 *   last viewed step on next visit.
 * - Emits analytics events on every state transition.
 * - Exposes a `requestStart()` so the dashboard can trigger the
 *   tour for new users (or for users who skipped earlier).
 *
 * Design notes
 * ────────────
 * - The service is the source of truth. The visual is rendered by
 *   FtTourOverlayComponent which subscribes to `activeStep` and
 *   `isActive` signals.
 * - We re-evaluate target bounds on every step change and on scroll
 *   / resize events (handled in the overlay component).
 * - We do NOT scroll the target into view automatically; the overlay
 *   component handles smooth scrolling when needed.
 */
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import {
  TourStep,
  TourState,
  TourStatus,
  DEFAULT_TOUR_STATE,
} from '../../shared/models/tour.types';
import { FtAnalyticsService } from './analytics.service';

const STORAGE_KEY = 'flowr_onboarding_tour';

export const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'tour.steps.welcome.title',
    descriptionKey: 'tour.steps.welcome.description',
    targetSelector: '.dashboard-greeting',
    tooltipPosition: 'bottom',
  },
  {
    id: 'telegram',
    titleKey: 'tour.steps.telegram.title',
    descriptionKey: 'tour.steps.telegram.description',
    targetSelector: '[data-tour="telegram-connect"]',
    tooltipPosition: 'left',
    actionKey: 'tour.steps.telegram.cta',
    actionRoute: '/settings',
  },
  {
    id: 'categories',
    titleKey: 'tour.steps.categories.title',
    descriptionKey: 'tour.steps.categories.description',
    targetSelector: '[data-tour="categories"]',
    tooltipPosition: 'right',
    actionKey: 'tour.steps.categories.cta',
    actionRoute: '/categories',
  },
  {
    id: 'log-expense',
    titleKey: 'tour.steps.logExpense.title',
    descriptionKey: 'tour.steps.logExpense.description',
    targetSelector: '.dashboard-greeting__cta',
    tooltipPosition: 'bottom',
    actionKey: 'tour.steps.logExpense.cta',
    actionRoute: '/transactions/new',
  },
  {
    id: 'done',
    titleKey: 'tour.steps.done.title',
    descriptionKey: 'tour.steps.done.description',
    targetSelector: 'body',
    tooltipPosition: 'auto',
    highlightPadding: 0,
  },
];

@Injectable({ providedIn: 'root' })
export class FtTourService {
  private readonly analytics = inject(FtAnalyticsService);

  // ── Step definition ────────────────────────────────────────────
  readonly steps: readonly TourStep[] = ONBOARDING_TOUR_STEPS;

  // ── Reactive state ─────────────────────────────────────────────
  private readonly _isActive = signal(false);
  private readonly _currentStepIndex = signal(0); // 0-based internal
  private readonly _state = signal<TourState>(this.readPersistedState());

  readonly isActive = this._isActive.asReadonly();
  readonly totalSteps = this.steps.length;
  readonly currentStepIndex = this._currentStepIndex.asReadonly();
  readonly currentStep = computed<TourStep | null>(() => {
    if (!this._isActive()) return null;
    return this.steps[this._currentStepIndex()] ?? null;
  });
  /** 1-based step number for display ("Step 3 of 5") */
  readonly currentStepNumber = computed(() => this._currentStepIndex() + 1);
  readonly tourState = this._state.asReadonly();

  constructor() {
    // If the persisted state was "in_progress", we do NOT auto-resume;
    // the dashboard decides when to start (via requestStart()).
    // But we expose the state so the dashboard can prompt the user.
    effect(() => {
      this.persistState(this._state());
    });
  }

  // ── Public API ─────────────────────────────────────────────────

  /** Has the user completed or skipped the tour before? */
  hasFinishedTour(): boolean {
    const s = this._state();
    return s.status === 'completed' || s.status === 'skipped';
  }

  /** Should the dashboard show a tour trigger card? */
  shouldPromptForTour(): boolean {
    return !this.hasFinishedTour();
  }

  /**
   * Request the tour to start. If a previous run was interrupted,
   * resumes from that step. Fires `onboarding_tour_started` (or
   * `_resumed`) event.
   */
  start(): void {
    const s = this._state();
    const resumeStep = s.status === 'in_progress' ? Math.max(0, s.currentStep - 1) : 0;
    this._currentStepIndex.set(resumeStep);
    this._isActive.set(true);

    if (s.status === 'in_progress') {
      this.analytics.trackEvent('onboarding_tour_started', {
        step: this.currentStepNumber(),
        step_id: this.steps[resumeStep]?.id,
      });
    } else {
      this.updateStatus('in_progress');
      this.analytics.trackEvent('onboarding_tour_started', {
        step: this.currentStepNumber(),
        step_id: this.steps[resumeStep]?.id,
      });
    }
  }

  stop(): void {
    this._isActive.set(false);
  }

  next(): void {
    const i = this._currentStepIndex();
    if (i >= this.steps.length - 1) {
      this.complete();
      return;
    }
    const nextIdx = i + 1;
    this._currentStepIndex.set(nextIdx);
    this.updateStatus('in_progress');
    this.analytics.trackEvent('onboarding_tour_step_viewed', {
      step: nextIdx + 1,
      step_id: this.steps[nextIdx].id,
    });
  }

  previous(): void {
    const i = this._currentStepIndex();
    if (i <= 0) return;
    const prevIdx = i - 1;
    this._currentStepIndex.set(prevIdx);
    this.analytics.trackEvent('onboarding_tour_step_viewed', {
      step: prevIdx + 1,
      step_id: this.steps[prevIdx].id,
    });
  }

  skip(): void {
    this.updateStatus('skipped');
    this.analytics.trackEvent('onboarding_tour_skipped', {
      step: this.currentStepNumber(),
      step_id: this.currentStep()?.id,
    });
    this._isActive.set(false);
  }

  complete(): void {
    this.updateStatus('completed', { completedAt: new Date().toISOString() });
    this.analytics.trackEvent('onboarding_tour_completed', {
      step: this.currentStepNumber(),
      step_id: this.currentStep()?.id,
    });
    this._isActive.set(false);
  }

  /** Reset state — used by the "Replay tour" button in settings. */
  resetTour(): void {
    this._state.set({ ...DEFAULT_TOUR_STATE, updatedAt: Date.now() });
    this._currentStepIndex.set(0);
    this._isActive.set(false);
  }

  // ── Persistence ────────────────────────────────────────────────

  private updateStatus(status: TourStatus, extra: Partial<TourState> = {}): void {
    this._state.set({
      ...this._state(),
      ...extra,
      status,
      currentStep: this._currentStepIndex() + 1,
      updatedAt: Date.now(),
    });
  }

  private readPersistedState(): TourState {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_TOUR_STATE, updatedAt: Date.now() };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_TOUR_STATE, updatedAt: Date.now() };
      const parsed = JSON.parse(raw) as TourState;
      return { ...DEFAULT_TOUR_STATE, ...parsed };
    } catch {
      return { ...DEFAULT_TOUR_STATE, updatedAt: Date.now() };
    }
  }

  private persistState(state: TourState): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* quota — fine, fresh state next time */ }
  }
}
