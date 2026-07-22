import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type GmailState = 'idle' | 'connecting' | 'connected';

export interface GmailTransaction {
  id: string;
  bankName: string;
  amount: number;
  currency: string;
  receivedAt: string;
}

export interface GmailStatus {
  connected: boolean;
  email: string | null;
  lastSyncAt: string | null;
  lastTransactions: GmailTransaction[];
}

interface GmailSyncResponse {
  imported: number;
  lastSyncAt: string;
}

const FIRST_CONNECT_FLAG = 'ft.gmail.firstConnected';

@Injectable({ providedIn: 'root' })
export class GmailLinkService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api/banking`;

  readonly state = signal<GmailState>('idle');
  readonly email = signal<string | null>(null);
  readonly lastSyncAt = signal<string | null>(null);
  readonly lastTransactions = signal<GmailTransaction[]>([]);
  readonly syncing = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * True when the user is viewing the connected state but has not yet
   * seen the celebratory "first connect" flash. Cleared from localStorage
   * after the flash plays once.
   */
  readonly isFirstConnect = signal(this.readFirstConnectFlag());

  /** Derived: are we currently in a transient non-connected state? */
  readonly isBusy = computed(() => this.state() === 'connecting' || this.syncing());

  /** Auto-fetch on construction so the section can render correctly. */
  constructor() {
    this.refreshStatus();
  }

  ngOnDestroy(): void {
    /* nothing to clean up — HttpClient handles its own subscriptions */
  }

  /** Pull current status from the backend. */
  refreshStatus(): void {
    this.http.get<GmailStatus>(`${this.api}/gmail-status`).subscribe({
      next: (status) => this.applyStatus(status),
      error: () => {
        // Soft fail: stay in idle so the connect button is offered
        this.state.set('idle');
      },
    });
  }

  /** Trigger a manual sync. */
  syncNow(): void {
    if (this.syncing() || this.state() !== 'connected') return;
    this.syncing.set(true);
    this.error.set(null);

    this.http.post<GmailSyncResponse>(`${this.api}/sync-gmail`, {}).subscribe({
      next: (res) => {
        this.lastSyncAt.set(res.lastSyncAt);
        this.syncing.set(false);
        // Re-fetch the status so we get the updated lastTransactions list
        this.refreshStatus();
      },
      error: () => {
        this.syncing.set(false);
        this.error.set('settings.gmail.sync_failed');
      },
    });
  }

  /**
   * Mark Gmail as connected (called by the section after OAuth success).
   * Triggers the "first connect" flash animation only the first time.
   */
  markConnected(): void {
    this.state.set('connected');
    if (this.isFirstConnect()) {
      this.clearFirstConnectFlag();
      this.isFirstConnect.set(false);
    }
    this.refreshStatus();
  }

  /** Reset to "not connected" — used after the user disconnects. */
  markDisconnected(): void {
    this.state.set('idle');
    this.email.set(null);
    this.lastSyncAt.set(null);
    this.lastTransactions.set([]);
    this.error.set(null);
  }

  private applyStatus(status: GmailStatus): void {
    this.email.set(status.email);
    this.lastSyncAt.set(status.lastSyncAt);
    this.lastTransactions.set(status.lastTransactions ?? []);

    if (status.connected) {
      // First time we observe a successful connection from the server
      // (page reload, fresh session) — only flash the celebration if the
      // localStorage flag is still set.
      if (this.state() !== 'connected' && this.isFirstConnect()) {
        this.clearFirstConnectFlag();
        this.isFirstConnect.set(false);
      }
      this.state.set('connected');
    } else {
      this.state.set('idle');
    }
  }

  private readFirstConnectFlag(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(FIRST_CONNECT_FLAG) === 'pending';
    } catch {
      return false;
    }
  }

  private clearFirstConnectFlag(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(FIRST_CONNECT_FLAG);
    } catch {
      /* swallow quota / privacy errors */
    }
  }
}
