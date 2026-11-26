import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Logger, LoggerService, UIBrandingService } from 'core';
import { Observable, map, tap } from 'rxjs';
import { HyperiotLogoMobilePath, HyperiotLogoPath } from '../../constants';
import { ThemeColors, ThemeService, isHexColor } from '../theme/theme.service';

export interface BrandingLogo {
  standard: SafeResourceUrl | string;
  mobile: SafeResourceUrl | string;
}

export interface BrandingChanges {
  colors: ThemeColors;
  /** When missing, the current logo is kept. */
  logo?: File;
}

interface UiBranding {
  colorScheme?: string | null;
  logoBase64?: string | null;
}

const BRANDING_URL = '/hyperiot/ui-branding';

const DEFAULT_LOGO: BrandingLogo = {
  standard: HyperiotLogoPath,
  mobile: HyperiotLogoMobilePath,
};

/** Reads `{"primaryColor": "#0956b6"}` (JSON string or object); a legacy secondaryColor is ignored. */
export function parseColorScheme(value: unknown): ThemeColors | null {
  let scheme: unknown = value;
  if (typeof value === 'string') {
    try {
      scheme = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof scheme !== 'object' || scheme === null) {
    return null;
  }
  const { primaryColor } = scheme as Record<string, unknown>;
  return isHexColor(primaryColor) ? { primary: primaryColor.toLowerCase() } : null;
}

export function formatColorScheme(colors: ThemeColors): string {
  return JSON.stringify({ primaryColor: colors.primary });
}

/** Logo and colors of the user, saved by the ui-branding API; the colors go to ThemeService. */
@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly uiBrandingService = inject(UIBrandingService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly themeService = inject(ThemeService);
  private readonly logger = new Logger(inject(LoggerService));

  /** Null when the HyperIoT logo is used. */
  private readonly customLogo = signal<SafeResourceUrl | null>(null);
  private readonly branded = signal(false);

  readonly logo = computed<BrandingLogo>(() => {
    const logo = this.customLogo();
    return logo ? { standard: logo, mobile: logo } : DEFAULT_LOGO;
  });

  /** The backend requires a logo in the first saved branding. */
  readonly isBranded = this.branded.asReadonly();

  constructor() {
    this.logger.registerClass('BrandingService');
  }

  load(): void {
    this.uiBrandingService.getUIBranding().subscribe({
      next: (branding: UiBranding) => this.apply(branding),
      error: () => this.clear(),
    });
  }

  /** PUT when there is a new logo, PATCH (colors only) otherwise. */
  save({ colors, logo }: BrandingChanges): Observable<void> {
    const formData = new FormData();
    formData.append('colorScheme', formatColorScheme(colors));
    if (logo) {
      formData.append('name', '');
      formData.append('logo', logo, logo.name);
      formData.append('favicon', logo, logo.name);
    }
    const request = logo
      ? this.http.put<UiBranding>(BRANDING_URL, formData)
      : this.http.patch<UiBranding>(BRANDING_URL, formData);
    return request.pipe(
      tap((branding) => this.apply(branding)),
      map(() => undefined),
    );
  }

  restoreDefaults(): Observable<void> {
    return this.http.delete(BRANDING_URL).pipe(
      tap(() => this.clear()),
      map(() => undefined),
    );
  }

  /** Local reset without calling the API, for example at logout. */
  clear(): void {
    this.customLogo.set(null);
    this.branded.set(false);
    this.themeService.reset();
  }

  private apply(branding: UiBranding): void {
    if (branding.logoBase64) {
      this.customLogo.set(this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + branding.logoBase64));
    }
    this.branded.set(true);
    const colors = parseColorScheme(branding.colorScheme);
    if (!colors) {
      this.logger.warn('Invalid color scheme, the default colors are used', branding.colorScheme);
    }
    this.themeService.setColors(colors);
  }
}
