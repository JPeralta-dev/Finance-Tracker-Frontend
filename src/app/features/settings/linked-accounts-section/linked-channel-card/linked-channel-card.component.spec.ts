import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LinkedChannelCardComponent } from './linked-channel-card.component';

describe('LinkedChannelCardComponent', () => {
  let fixture: ComponentFixture<LinkedChannelCardComponent>;
  let component: LinkedChannelCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedChannelCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkedChannelCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to disconnected state with connect button visible', () => {
    expect(component.state()).toBe('disconnected');
    const btn = fixture.debugElement.query(By.css('.channel-card__btn--primary'));
    expect(btn).toBeTruthy();
  });

  it('reflects state in computed flags', () => {
    expect(component.isDisconnected()).toBeTrue();
    expect(component.isConnecting()).toBeFalse();
    expect(component.isConnected()).toBeFalse();

    fixture.componentRef.setInput('state', 'connecting');
    fixture.detectChanges();
    expect(component.isConnecting()).toBeTrue();

    fixture.componentRef.setInput('state', 'connected');
    fixture.detectChanges();
    expect(component.isConnected()).toBeTrue();
  });

  it('emits connect when button is clicked (disconnected)', () => {
    spyOn(component.connect, 'emit');
    component.onConnect();
    expect(component.connect.emit).toHaveBeenCalled();
  });

  it('does not emit connect while connecting', () => {
    spyOn(component.connect, 'emit');
    fixture.componentRef.setInput('state', 'connecting');
    component.onConnect();
    expect(component.connect.emit).not.toHaveBeenCalled();
  });

  it('does not emit connect when coming soon', () => {
    spyOn(component.connect, 'emit');
    fixture.componentRef.setInput('showComingSoon', true);
    component.onConnect();
    expect(component.connect.emit).not.toHaveBeenCalled();
  });

  it('emits sync and disconnect when in connected state', () => {
    spyOn(component.sync, 'emit');
    spyOn(component.disconnect, 'emit');
    fixture.componentRef.setInput('state', 'connected');
    component.onSync();
    component.onDisconnect();
    expect(component.sync.emit).toHaveBeenCalled();
    expect(component.disconnect.emit).toHaveBeenCalled();
  });

  it('blocks sync and disconnect when not connected', () => {
    spyOn(component.sync, 'emit');
    spyOn(component.disconnect, 'emit');
    component.onSync();
    component.onDisconnect();
    expect(component.sync.emit).not.toHaveBeenCalled();
    expect(component.disconnect.emit).not.toHaveBeenCalled();
  });

  it('applies connected modifier class when connected', () => {
    fixture.componentRef.setInput('state', 'connected');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.channel-card'));
    expect(card.nativeElement.classList).toContain('channel-card--connected');
  });

  it('applies just-linked class only when isFirstConnect is true', () => {
    fixture.componentRef.setInput('isFirstConnect', true);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.channel-card'));
    expect(card.nativeElement.classList).toContain('channel-card--just-linked');
  });

  it('applies coming-soon class when showComingSoon is true', () => {
    fixture.componentRef.setInput('showComingSoon', true);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.channel-card'));
    expect(card.nativeElement.classList).toContain('channel-card--coming-soon');
  });

  it('renders recent list only when items are present', () => {
    fixture.componentRef.setInput('state', 'connected');
    fixture.componentRef.setInput('recent', [
      { id: '1', iconKey: 'bank', primary: 'Bancolombia', secondary: 'hace 2h', amount: '$85,250' },
    ]);
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('.channel-card__recent-item'));
    expect(items.length).toBe(1);
  });

  it('hasCustomDisconnected hides the default primary button', () => {
    fixture.componentRef.setInput('hasCustomDisconnected', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.channel-card__state--disconnected .channel-card__btn--primary'));
    expect(btn).toBeNull();
  });
});
