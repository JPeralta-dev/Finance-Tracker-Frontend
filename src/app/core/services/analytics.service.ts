/**
 * FtAnalyticsService — PostHog wrapper with GDPR consent, event batching,
 * offline queue, and a signal-based API.
 *
 * Design notes
 * ────────────
 * - PostHog SDK is **lazy-loaded** with a dynamic import so the bundle
 *   stays small until the user actually consents.
 * - Events are queued in memory and flushed every 5s OR when the queue
 *   hits 10 events (whichever comes first).
 * - If the user is offline (navigator.onLine === false) or the SDK is
 *   not yet loaded, events are kept in the queue and retried on the
 *   next flush tick.
 * - Consent is stored in localStorage under `flowr_analytics_consent`
 *   and exposed as a signal so the rest of the app can react to it.
 *
 * Usage
 * ─────
 *   constructor(private analytics: FtAnalyticsService) {}
 *
 *   ngOnInit() {
 *     this.analytics.init();
 *     this.analytics.trackEvent('paywall_modal_shown', { trigger: 'premium_guard' });
 *   }
 */
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AnalyticsEventName,
  AnalyticsProperties,
  QueuedEvent,
} from '../models/analytics-event.model';

const CONSENT_KEY = 'flowr_analytics_consent';
const QUEUE_KEY = 'flowr_analytics_queue';
const USER_PROPS_KEY = 'flowr_analytics_user_props';
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 10;
const MAX_QUEUE_SIZE = 200; // Hard cap to avoid unbounded localStorage growth

type ConsentState = 'pending' | 'granted' | 'denied';

/**
 * Minimal PostHog browser SDK surface we rely on. We avoid importing the
 * types package so the rest of the app doesn't pull it into the main bundle.
 */
interface PostHogLike {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  opt_out_capturing: () => void;
  opt_in_capturing: () => void;
  set_config: (cfg: Record<string, unknown>) => void;
  isFeatureEnabled?: (flag: string) => boolean;
}

@Injectable({ providedIn: 'root' })
export class FtAnalyticsService {
  private readonly cfg = environment.posthog;

  // ── Public signals ──────────────────────────────────────────────
  private readonly _consent = signal<ConsentState>(this.readStoredConsent());
  readonly consent = this._consent.asReadonly();
  readonly isReady = signal(false);
  readonly hasConsent = computed(() => this._consent() === 'granted');

  // ── Internal state ──────────────────────────────────────────────
  private posthog: PostHogLike | null = null;
  private queue: QueuedEvent[] = [];
  private distinctId: string | null = null;
  private userProps: AnalyticsProperties = {};
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private onlineListener?: () => void;
  private visibilityListener?: () => void;

  constructor() {
    // Respect Do Not Track — auto-deny if the browser sends the header.
    if (this.dntEnabled() && this._consent() === 'pending') {
      this.setConsent('denied', { persist: true, silent: true });
    }

    // Whenever consent transitions to "granted", bootstrap PostHog.
    effect(() => {
      const state = this._consent();
      if (state === 'granted' && this.cfg.enabled) {
        this.bootstrapPostHog();
      } else if (state === 'denied' && this.posthog) {
        this.posthog.opt_out_capturing();
      }
    });
  }

  // ── Public API ──────────────────────────────────────────────────

  /**
   * Initialize the service. Idempotent. Safe to call from APP_INITIALIZER
   * or from any component constructor.
   */
  init(): void {
    // Re-hydrate any queued events left over from a previous session.
    this.queue = this.readPersistedQueue();

    // Spin up the flush timer regardless of consent so we can drain the
    // queue the moment the user opts in.
    if (!this.flushTimer && typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
      this.onlineListener = () => { if (navigator.onLine) this.flush(); };
      this.visibilityListener = () => { if (!document.hidden) this.flush(); };
      window.addEventListener('online', this.onlineListener);
      document.addEventListener('visibilitychange', this.visibilityListener);
    }

    // Replay persisted user props (tier, etc.) — useful after a refresh.
    const stored = this.readStoredUserProps();
    if (stored) this.userProps = { ...this.userProps, ...stored };
  }

  /** Grant tracking consent. Persists the decision and bootstraps PostHog. */
  grantConsent(): void {
    this.setConsent('granted', { persist: true });
  }

  /** Deny tracking consent. Persists the decision and stops any tracking. */
  denyConsent(): void {
    this.setConsent('denied', { persist: true });
  }

  /** Withdraw consent (alias for deny). Tracked separately for analytics. */
  withdrawConsent(): void {
    this.denyConsent();
  }

  /** Track a custom event. Safe to call before init() or without consent. */
  trackEvent(name: AnalyticsEventName, properties?: AnalyticsProperties): void {
    this.enqueue({ name, properties, timestamp: Date.now() });
  }

  /**
   * Identify the current user. Triggers once PostHog is loaded.
   * If we already have a distinctId we just update the person properties.
   */
  identifyUser(userId: string, properties?: AnalyticsProperties): void {
    this.distinctId = userId;
    if (properties) {
      this.userProps = { ...this.userProps, ...properties };
      this.persistUserProps(this.userProps);
    }
    if (this.posthog) {
      this.posthog.identify(userId, this.userProps);
    }
    this.flush();
  }

  /** Track a SPA route change. */
  trackPageView(path: string, extra?: AnalyticsProperties): void {
    this.trackEvent('page_viewed', {
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...extra,
    });
  }

  /** Reset session — call on logout. */
  reset(): void {
    this.distinctId = null;
    this.userProps = {};
    this.persistUserProps({});
    if (this.posthog) this.posthog.reset();
  }

  /** Force a manual flush — useful right before a navigation that unloads the page. */
  flushNow(): void {
    this.flush();
  }

  // ── Internals ───────────────────────────────────────────────────

  private enqueue(event: QueuedEvent): void {
    if (!this.isReady() && this._consent() !== 'granted') {
      // Still persist the event so we can replay it once the user opts in.
      this.queue.push(event);
      this.trimQueue();
      this.persistQueue();
      return;
    }
    this.queue.push(event);
    this.trimQueue();
    if (this.queue.length >= MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  private flush(): void {
    if (!this.posthog) {
      // No SDK yet — keep events in the queue. They'll be drained when init resolves.
      this.persistQueue();
      return;
    }
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);
    for (const evt of batch) {
      try {
        this.posthog.capture(evt.name, {
          ...this.userProps,
          ...evt.properties,
          queued_at: evt.timestamp,
        });
      } catch (err) {
        // SDK threw — push the event back to the head of the queue for retry.
        this.queue.unshift(evt);
        this.persistQueue();
        // eslint-disable-next-line no-console
        console.warn('[analytics] PostHog capture failed', err);
        return;
      }
    }
    this.persistQueue();
  }

  /** Lazy-load PostHog from CDN and init it. */
  private async bootstrapPostHog(): Promise<void> {
    if (this.posthog) {
      this.posthog.opt_in_capturing();
      return;
    }
    if (!this.cfg.enabled || !this.cfg.apiKey) {
      this.isReady.set(true);
      return;
    }

    try {
      // Dynamic import keeps PostHog out of the main bundle. The SDK is
      // tiny (~25KB gzip) but worth deferring until consent is granted.
      const mod = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/posthog-js@1.130.0/dist/array.js')
        .catch(() => null);

      if (mod && (mod as any).default) {
        this.posthog = (mod as any).default as PostHogLike;
      } else {
        // Fallback for environments where the CDN ESM is unavailable.
        // We gracefully degrade: events are still queued + persisted, but
        // never sent. The dashboard will surface this as "tracking disabled".
        this.isReady.set(true);
        return;
      }

      this.posthog.init(this.cfg.apiKey, {
        api_host: this.cfg.apiHost,
        capture_pageview: false, // We track page views manually for control
        capture_pageleave: true,
        autocapture: false,        // Be explicit — no surprise tracking
        disable_session_recording: true,
        person_profiles: 'identified_only',
        debug: this.cfg.debug,
        loaded: () => {
          this.isReady.set(true);
          if (this.distinctId) {
            this.posthog?.identify(this.distinctId, this.userProps);
          }
          this.flush();
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] PostHog bootstrap failed', err);
      this.isReady.set(true);
    }
  }

  private setConsent(
    state: ConsentState,
    opts: { persist: boolean; silent?: boolean },
  ): void {
    this._consent.set(state);
    if (opts.persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, state);
    }
  }

  private readStoredConsent(): ConsentState {
    if (typeof localStorage === 'undefined') return 'pending';
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'granted' || v === 'denied') return v;
    return 'pending';
  }

  private dntEnabled(): boolean {
    if (typeof navigator === 'undefined') return false;
    return (
      navigator.doNotTrack === '1' ||
      (window as any).doNotTrack === '1' ||
      navigator.doNotTrack === 'yes'
    );
  }

  // ── localStorage helpers ────────────────────────────────────────

  private persistQueue(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch { /* quota — drop the queue, fresh start */ }
  }

  private readPersistedQueue(): QueuedEvent[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as QueuedEvent[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistUserProps(props: AnalyticsProperties): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(USER_PROPS_KEY, JSON.stringify(props));
    } catch { /* ignore */ }
  }

  private readStoredUserProps(): AnalyticsProperties | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_PROPS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private trimQueue(): void {
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE);
    }
  }
}
