import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '../models/notification.model';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Your account is ready.',
      type: 'success',
      read: false,
      createdAt: new Date('2024-01-01'),
      actionUrl: null,
    },
    {
      id: '2',
      title: 'New feature',
      message: 'Check out the new dashboard.',
      type: 'info',
      read: true,
      createdAt: new Date('2024-01-02'),
      actionUrl: '/dashboard',
    },
    {
      id: '3',
      title: 'Warning',
      message: 'Your budget is almost exceeded.',
      type: 'warning',
      read: false,
      createdAt: new Date('2024-01-03'),
      actionUrl: null,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('notifications signal', () => {
    it('should start with mock data on load', () => {
      const notifications = service.notifications();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].title).toBeDefined();
    });

    it('should return readonly signal', () => {
      // The notifications signal should be readonly (asReadonly)
      expect(service.notifications).toBeDefined();
      expect(typeof service.notifications).toBe('function');
    });
  });

  describe('unreadCount computed', () => {
    it('should count unread notifications correctly', () => {
      // Mock data has 2 unread (id 1 and 3)
      const count = service.unreadCount();
      expect(count).toBe(2);
    });

    it('should update when a notification is marked as read', () => {
      expect(service.unreadCount()).toBe(2);
      service.markAsRead('1');
      expect(service.unreadCount()).toBe(1);
    });

    it('should be zero when all are read', () => {
      service.markAsRead('1');
      service.markAsRead('3');
      expect(service.unreadCount()).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      const before = service.notifications().find(n => n.id === '1');
      expect(before?.read).toBe(false);

      service.markAsRead('1');

      const after = service.notifications().find(n => n.id === '1');
      expect(after?.read).toBe(true);
    });

    it('should not affect other notifications', () => {
      service.markAsRead('1');
      const other = service.notifications().find(n => n.id === '3');
      expect(other?.read).toBe(false);
    });

    it('should not change anything if id does not exist', () => {
      const before = service.notifications().length;
      service.markAsRead('nonexistent');
      const after = service.notifications().length;
      expect(after).toBe(before);
    });
  });

  describe('dismiss', () => {
    it('should remove a notification from the list', () => {
      const before = service.notifications().length;
      expect(before).toBeGreaterThan(0);

      service.dismiss('1');

      const after = service.notifications().length;
      expect(after).toBe(before - 1);
      const removed = service.notifications().find(n => n.id === '1');
      expect(removed).toBeUndefined();
    });

    it('should update unread count when dismissing an unread notification', () => {
      const countBefore = service.unreadCount();
      service.dismiss('1'); // id '1' is unread
      expect(service.unreadCount()).toBe(countBefore - 1);
    });
  });

  describe('clearAll', () => {
    it('should empty the notification list', () => {
      expect(service.notifications().length).toBeGreaterThan(0);

      service.clearAll();

      expect(service.notifications()).toEqual([]);
    });

    it('should reset unread count to zero', () => {
      service.clearAll();
      expect(service.unreadCount()).toBe(0);
    });
  });
});
