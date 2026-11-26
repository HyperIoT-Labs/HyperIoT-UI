import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

/** Colors the user can choose, as CSS hex colors. The secondary color is derived in CSS. */
export interface ThemeColors {
  primary: string;
}

/** Keep in sync with the defaults in src/assets/styles/theme/_brand.scss. */
export const DEFAULT_THEME_COLORS: Readonly<ThemeColors> = {
  primary: '#0956b6',
};

const PRIMARY_VARIABLE = '--hyt-brand-primary';

const STORAGE_KEY = 'hytThemeColors';

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

/** Applies the user's colors at runtime by writing --hyt-brand-primary on the root element. */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  /** Null when the default colors are used. */
  private readonly customColors = signal<ThemeColors | null>(null);

  readonly colors = computed(() => this.customColors() ?? DEFAULT_THEME_COLORS);

  readonly hasCustomColors = computed(() => this.customColors() !== null);

  /** Called before the first render, so the default colors do not flash while the branding loads. */
  restoreSavedColors(): void {
    const saved = this.readSavedColors();
    if (saved) {
      this.setColors(saved);
    }
  }

  /** Applies and saves the colors, or the default ones with null. Invalid colors are ignored. */
  setColors(colors: ThemeColors | null): void {
    const valid = colors && isHexColor(colors.primary) ? { primary: colors.primary.toLowerCase() } : null;
    this.customColors.set(valid);
    const style = this.document.documentElement.style;
    if (valid) {
      style.setProperty(PRIMARY_VARIABLE, valid.primary);
    } else {
      style.removeProperty(PRIMARY_VARIABLE);
    }
    this.saveColors(valid);
  }

  reset(): void {
    this.setColors(null);
  }

  private readSavedColors(): ThemeColors | null {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (typeof saved !== 'object' || saved === null) {
        return null;
      }
      const { primary } = saved as Record<string, unknown>;
      return isHexColor(primary) ? { primary } : null;
    } catch {
      return null;
    }
  }

  private saveColors(colors: ThemeColors | null): void {
    try {
      if (colors) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage not available: the colors are only applied.
    }
  }
}
