/**
 * FtReferralCodeInputComponent — compact input to apply a referral code
 * on the subscription page. Validates format on blur and emits the
 * normalized code via a one-way output.
 */
import {
  Component,
  ChangeDetectionStrategy,
  output,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtReferralService } from '../../../core/services/referral.service';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-referral-code-input',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="referral-input">
      <label for="referral-code" class="referral-input__label">
        {{ 'referral.input.label' | translate }}
      </label>
      <div class="referral-input__row">
        <input
          id="referral-code"
          class="referral-input__field"
          [class.referral-input__field--valid]="isValid() === true"
          [class.referral-input__field--invalid]="isValid() === false"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          maxlength="8"
          [placeholder]="'referral.input.placeholder' | translate"
          [value]="raw()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        <span class="referral-input__icon" aria-hidden="true">
          @if (isValid() === true) {
            <ng-icon [name]="iconCheck" size="18px" class="referral-input__icon--ok" />
          } @else if (isValid() === false) {
            <ng-icon [name]="iconClose" size="18px" class="referral-input__icon--bad" />
          }
        </span>
        <button
          type="button"
          class="referral-input__apply"
          [disabled]="isValid() !== true"
          (click)="apply()"
        >
          {{ 'referral.input.apply' | translate }}
        </button>
      </div>
      @if (isValid() === false) {
        <p class="referral-input__msg referral-input__msg--err" role="alert">
          {{ 'referral.input.invalid' | translate }}
        </p>
      } @else if (applied()) {
        <p class="referral-input__msg referral-input__msg--ok" role="status">
          {{ 'referral.input.applied' | translate }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .referral-input { display: flex; flex-direction: column; gap: 6px; }
    .referral-input__label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    }
    .referral-input__row {
      display: flex;
      align-items: stretch;
      gap: 8px;
    }
    .referral-input__field {
      flex: 1 1 auto;
      min-width: 0;
      padding: 10px 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 14px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
      color: var(--text-primary, #fff);
      border: 1px solid var(--border-default, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .referral-input__field:focus { border-color: var(--accent-mid, #a78bfa); }
    .referral-input__field--valid { border-color: var(--success, #2dd4bf); }
    .referral-input__field--invalid { border-color: var(--danger, #ef4444); }

    .referral-input__icon { display: inline-flex; align-items: center; padding: 0 4px; }
    .referral-input__icon--ok { color: var(--success, #2dd4bf); }
    .referral-input__icon--bad { color: var(--danger, #ef4444); }

    .referral-input__apply {
      padding: 0 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.15s ease;
      font-family: inherit;
    }
    .referral-input__apply:hover { transform: translateY(-1px); }
    .referral-input__apply:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .referral-input__msg {
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .referral-input__msg--err { color: var(--danger, #fca5a5); }
    .referral-input__msg--ok { color: var(--success, #5eead4); }
  `],
})
export class FtReferralCodeInputComponent {
  private readonly referral = inject(FtReferralService);

  readonly iconCheck = ICONS.check;
  readonly iconClose = ICONS.close;

  readonly raw = signal('');
  readonly applied = signal(false);

  readonly isValid = computed<boolean | null>(() => {
    const v = this.raw();
    if (v.length === 0) return null;
    return this.referral.isValidCode(v);
  });

  readonly appliedCode = output<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.raw.set(this.referral.formatCode(input.value));
    this.applied.set(false);
  }

  onBlur(): void {
    // Re-normalize on blur to fix stray characters
    this.raw.set(this.referral.formatCode(this.raw()));
  }

  apply(): void {
    if (this.isValid() !== true) return;
    this.applied.set(true);
    this.appliedCode.emit(this.raw());
  }
}
