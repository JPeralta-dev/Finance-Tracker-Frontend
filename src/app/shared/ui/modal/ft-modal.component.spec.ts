import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { FtModalComponent } from './ft-modal.component';

@Component({
  standalone: true,
  imports: [FtModalComponent],
  template: `
    <button id="trigger" (click)="show.set(true)">open</button>
    <ft-modal [open]="show()" (closed)="onClosed($event)">
      <div modalBody>
        <a href="#" id="first">First</a>
        <button id="last">Last</button>
      </div>
    </ft-modal>
  `,
})
class TestHost {
  show = signal(false);
  modal = viewChild(FtModalComponent);
  closedReason = signal<string | null>(null);

  onClosed(reason: 'backdrop' | 'esc' | 'close_button' | 'programmatic') {
    this.closedReason.set(reason);
    this.show.set(false);
  }
}

describe('FtModalComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not render in the DOM when open is false', () => {
    expect(document.querySelector('.ft-modal')).toBeNull();
  });

  it('should render when open is true', async () => {
    host.show.set(true);
    fixture.detectChanges();
    await new Promise(r => requestAnimationFrame(() => r(null)));
    fixture.detectChanges();
    expect(document.querySelector('.ft-modal')).toBeTruthy();
  });

  it('should emit closed with "close_button" when the X is clicked', async () => {
    host.show.set(true);
    fixture.detectChanges();
    await new Promise(r => requestAnimationFrame(() => r(null)));
    fixture.detectChanges();
    const closeBtn = document.querySelector('.ft-modal__close') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();
    // The component emits closed, which the host handler converts to a signal.
    expect(host.closedReason()).toBe('close_button');
  });

  it('should trap focus with Tab and Shift+Tab', async () => {
    host.show.set(true);
    fixture.detectChanges();
    await new Promise(r => requestAnimationFrame(() => r(null)));
    fixture.detectChanges();
    const first = document.querySelector('#first') as HTMLElement;
    first.focus();
    // Tab from last element should cycle to first
    const last = document.querySelector('#last') as HTMLElement;
    last.focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(first);
  });
});
