import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>(this._getMockData());
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  markAsRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  private _getMockData(): Notification[] {
    return [
      {
        id: '1',
        title: 'notifications.welcome.title',
        message: 'notifications.welcome.message',
        type: 'success',
        read: false,
        createdAt: new Date('2024-01-15'),
        actionUrl: null,
      },
      {
        id: '2',
        title: 'notifications.feature.title',
        message: 'notifications.feature.message',
        type: 'info',
        read: false,
        createdAt: new Date('2024-01-20'),
        actionUrl: '/dashboard',
      },
      {
        id: '3',
        title: 'notifications.budget.title',
        message: 'notifications.budget.message',
        type: 'warning',
        read: true,
        createdAt: new Date('2024-01-25'),
        actionUrl: null,
      },
    ];
  }
}
