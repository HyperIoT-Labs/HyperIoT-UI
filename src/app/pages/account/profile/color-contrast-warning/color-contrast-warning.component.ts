import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MIN_CONTRAST_ON_WHITE, contrastOnWhite, darkenForWhite } from '../../../../services/theme/color-contrast';
import { isHexColor } from '../../../../services/theme/theme.service';

/** Warns when a theme color is hard to read on white and suggests a darker version of it. */
@Component({
  selector: 'hyt-color-contrast-warning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatButtonModule, MatIconModule],
  template: `
    @if (suggestion(); as suggested) {
      <p class="message" role="status">
        <mat-icon class="icon" aria-hidden="true">warning</mat-icon>
        <span i18n="@@HYT_color_low_contrast">Hard to read as text on white: contrast {{ contrast() | number: '1.1-1' }}:1, at least {{ minContrast | number: '1.1-1' }}:1 is recommended.</span>
      </p>
      <button matButton="tonal" type="button" (click)="apply.emit(suggested)">
        <span class="swatch" [style.background]="suggested" aria-hidden="true"></span>
        <span i18n="@@HYT_color_use_darker">Use {{ suggested }}</span>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .message {
      display: flex;
      gap: 8px;
      margin: 0;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .icon {
      flex: none;
      color: var(--mat-sys-error);
    }
    button {
      min-height: 44px;
    }
    .swatch {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      vertical-align: middle;
      border-radius: 50%;
      border: 1px solid var(--mat-sys-outline);
    }
  `,
})
export class ColorContrastWarningComponent {
  readonly color = input<string | null | undefined>();

  /** Emits the suggested darker color. */
  readonly apply = output<string>();

  protected readonly minContrast = MIN_CONTRAST_ON_WHITE;

  protected readonly contrast = computed(() => {
    const color = this.color();
    return isHexColor(color) ? contrastOnWhite(color) : null;
  });

  protected readonly suggestion = computed(() => {
    const color = this.color();
    const contrast = this.contrast();
    return isHexColor(color) && contrast !== null && contrast < MIN_CONTRAST_ON_WHITE
      ? darkenForWhite(color)
      : null;
  });
}
