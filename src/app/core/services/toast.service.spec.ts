import { TestBed } from '@angular/core/testing';

import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a toast on success()', () => {
    // Act
    service.success('Success Title', 'Success Message');

    // Assert
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].title).toBe('Success Title');
    expect(toasts[0].message).toBe('Success Message');
    expect(toasts[0].id).toBeDefined();
    expect(toasts[0].duration).toBe(4000);
  });

  it('should create a toast on error()', () => {
    // Act
    service.error('Error Title', 'Error Message');

    // Assert
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].title).toBe('Error Title');
    expect(toasts[0].message).toBe('Error Message');
    expect(toasts[0].id).toBeDefined();
    expect(toasts[0].duration).toBe(4000);
  });

  it('should remove toast on remove()', () => {
    // Arrange
    service.success('Toast 1');
    service.error('Toast 2');
    const toastsBefore = service.toasts();
    expect(toastsBefore.length).toBe(2);
    const toastIdToRemove = toastsBefore[0].id;

    // Act
    service.remove(toastIdToRemove);

    // Assert
    const toastsAfter = service.toasts();
    expect(toastsAfter.length).toBe(1);
    expect(toastsAfter[0].id).not.toBe(toastIdToRemove);
  });
});
