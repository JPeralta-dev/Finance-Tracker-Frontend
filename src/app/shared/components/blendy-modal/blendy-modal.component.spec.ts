import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FtBlendyModalComponent } from './blendy-modal.component';
import { BlendyService } from '../../services/blendy.service';

// Host wrapper component to test signal inputs
@Component({
  standalone: true,
  imports: [FtBlendyModalComponent],
  template: `
    <ft-blendy-modal [open]="isOpen()" [blendyId]="blendyId()" (closed)="onClosed()">
      <p>Test Content</p>
    </ft-blendy-modal>
  `,
})
class TestHostComponent {
  isOpen = signal(false);
  blendyId = signal('test-modal');
  onClosed = jasmine.createSpy('onClosed');
}

describe('FtBlendyModalComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let mockBlendyService: jasmine.SpyObj<BlendyService>;

  beforeEach(() => {
    mockBlendyService = jasmine.createSpyObj('BlendyService', ['toggle', 'untoggle', 'update'], {
      prefersReducedMotion: signal(false),
    });

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: BlendyService, useValue: mockBlendyService }],
    });

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render backdrop and container when open is true', () => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();

      const backdrop = hostFixture.debugElement.query(By.css('.blendy-backdrop'));
      const container = hostFixture.debugElement.query(By.css('.blendy-container'));
      const target = hostFixture.debugElement.query(By.css('.blendy-target'));

      expect(backdrop).toBeTruthy();
      expect(container).toBeTruthy();
      expect(target).toBeTruthy();
    });

    it('should not render anything when open is false', () => {
      hostComponent.isOpen.set(false);
      hostFixture.detectChanges();

      const backdrop = hostFixture.debugElement.query(By.css('.blendy-backdrop'));
      const container = hostFixture.debugElement.query(By.css('.blendy-container'));

      expect(backdrop).toBeFalsy();
      expect(container).toBeFalsy();
    });

    it('should set data-blendy-to attribute on the target element', () => {
      hostComponent.isOpen.set(true);
      hostComponent.blendyId.set('category-modal');
      hostFixture.detectChanges();

      const target = hostFixture.debugElement.query(By.css('.blendy-target'));
      expect(target.attributes['data-blendy-to']).toBe('category-modal');
    });

    it('should set role="dialog" and aria-modal="true" on container', () => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();

      const container = hostFixture.debugElement.query(By.css('.blendy-container'));
      expect(container.attributes['role']).toBe('dialog');
      expect(container.attributes['aria-modal']).toBe('true');
    });

    it('should project content inside the container', () => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();

      const container = hostFixture.debugElement.query(By.css('.blendy-container'));
      expect(container.nativeElement.textContent).toContain('Test Content');
    });
  });

  describe('lifecycle', () => {
    it('should call blendyService.toggle() when open becomes true', fakeAsync(() => {
      hostComponent.isOpen.set(false);
      hostFixture.detectChanges();

      expect(mockBlendyService.toggle).not.toHaveBeenCalled();

      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick(); // flush setTimeout(0)

      expect(mockBlendyService.toggle).toHaveBeenCalledWith('test-modal');
    }));

    it('should NOT call toggle when open becomes false', fakeAsync(() => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick();

      mockBlendyService.toggle.calls.reset();

      hostComponent.isOpen.set(false);
      hostFixture.detectChanges();
      tick();

      expect(mockBlendyService.toggle).not.toHaveBeenCalled();
    }));
  });

  describe('close()', () => {
    it('should call blendyService.untoggle() with blendyId and callback', fakeAsync(() => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick();

      // Get the modal component instance
      const modalComponent = hostFixture.debugElement.query(
        By.directive(FtBlendyModalComponent),
      ).componentInstance as FtBlendyModalComponent;

      modalComponent.close();

      expect(mockBlendyService.untoggle).toHaveBeenCalledWith(
        'test-modal',
        jasmine.any(Function),
      );
    }));

    it('should emit closed event in the untoggle callback', fakeAsync(() => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick();

      const modalComponent = hostFixture.debugElement.query(
        By.directive(FtBlendyModalComponent),
      ).componentInstance as FtBlendyModalComponent;

      let capturedCallback: (() => void) | undefined;
      mockBlendyService.untoggle.and.callFake((_id: string, cb: () => void) => {
        capturedCallback = cb;
      });

      modalComponent.close();

      expect(capturedCallback).toBeDefined();
      capturedCallback!();
      expect(hostComponent.onClosed).toHaveBeenCalled();
    }));
  });

  describe('Escape key', () => {
    it('should call close() when Escape key is pressed', fakeAsync(() => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick();

      const modalComponent = hostFixture.debugElement.query(
        By.directive(FtBlendyModalComponent),
      ).componentInstance as FtBlendyModalComponent;

      const closeSpy = spyOn(modalComponent, 'close');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closeSpy).toHaveBeenCalled();
    }));

    it('should NOT call close() when Escape is pressed but modal is closed', () => {
      hostComponent.isOpen.set(false);
      hostFixture.detectChanges();

      const modalComponent = hostFixture.debugElement.query(
        By.directive(FtBlendyModalComponent),
      ).componentInstance as FtBlendyModalComponent;

      const closeSpy = spyOn(modalComponent, 'close');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('backdrop click', () => {
    it('should call close() when backdrop is clicked', fakeAsync(() => {
      hostComponent.isOpen.set(true);
      hostFixture.detectChanges();
      tick();

      const modalComponent = hostFixture.debugElement.query(
        By.directive(FtBlendyModalComponent),
      ).componentInstance as FtBlendyModalComponent;

      const closeSpy = spyOn(modalComponent, 'close');
      const backdrop = hostFixture.debugElement.query(By.css('.blendy-backdrop'));
      backdrop.triggerEventHandler('click', null);

      expect(closeSpy).toHaveBeenCalled();
    }));
  });
});
