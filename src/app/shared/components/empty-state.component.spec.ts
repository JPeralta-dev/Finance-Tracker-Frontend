import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { EmptyStateComponent } from './empty-state.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [EmptyStateComponent, CommonModule],
  template: `
    <ft-empty-state
      #defaultState
      variant="default"
      icon="wallet"
      title="Default title"
      description="Default desc"
      [showActionBtn]="true"
      actionLabel="Action"
      (action)="primaryFired = true"
    />

    <ft-empty-state
      #premiumState
      variant="premium-upsell"
      icon="star"
      title="Premium title"
      description="Premium desc"
      [showActionBtn]="true"
      actionLabel="Upgrade"
      secondaryText="Maybe later"
      [showSecondaryBtn]="true"
      (action)="premiumPrimaryFired = true"
      (secondaryAction)="premiumSecondaryFired = true"
    />

    <ft-empty-state
      #firstUseState
      variant="first-use"
      icon="plus"
      title="First use title"
      description="First use desc"
      [showActionBtn]="true"
      actionLabel="Create"
    />
  `,
})
class TestHost {
  @ViewChild('defaultState') defaultState?: EmptyStateComponent;
  @ViewChild('premiumState') premiumState?: EmptyStateComponent;
  @ViewChild('firstUseState') firstUseState?: EmptyStateComponent;
  primaryFired = false;
  premiumPrimaryFired = false;
  premiumSecondaryFired = false;
}

describe('EmptyStateComponent', () => {
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

  it('should render default variant with backwards-compatible behavior', () => {
    const defaultEl = fixture.nativeElement.querySelector('.empty-state--default');
    expect(defaultEl).toBeTruthy();
  });

  it('should apply premium-upsell class for that variant', () => {
    const el = fixture.nativeElement.querySelector('.empty-state--premium-upsell');
    expect(el).toBeTruthy();
  });

  it('should apply first-use class for that variant', () => {
    const el = fixture.nativeElement.querySelector('.empty-state--first-use');
    expect(el).toBeTruthy();
  });

  it('should fire primary action output when primary button clicked', () => {
    const premiumEl = fixture.nativeElement.querySelector('.empty-state--premium-upsell .empty-state__action');
    premiumEl.click();
    expect(host.premiumPrimaryFired).toBe(true);
  });

  it('should fire secondary action output when secondary button clicked', () => {
    const secondary = fixture.nativeElement.querySelector('.empty-state--premium-upsell .empty-state__secondary');
    secondary.click();
    expect(host.premiumSecondaryFired).toBe(true);
  });

  it('should expose variant as an input', () => {
    expect(host.defaultState?.variant).toBe('default');
    expect(host.premiumState?.variant).toBe('premium-upsell');
    expect(host.firstUseState?.variant).toBe('first-use');
  });
});
