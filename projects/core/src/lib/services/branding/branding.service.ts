import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lastValueFrom, Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { BrandingSelectors } from '../../store/branding/branding.selectors';
import { BrandingActions } from '../../store/branding/branding.actions';
import { BrandingTheme } from '../../models/branding';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {

  private _isBrandedTheme = false;

  get isBrandedTheme() {
    return this._isBrandedTheme;
  }

  logoPath$: Observable<{
    standard: SafeResourceUrl,
    mobile: SafeResourceUrl
  }> = this.store.select(BrandingSelectors.selectThemeLogoPath);

  constructor(
    private _sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private store: Store
  ) { }

  loadThemeBranding() {
    if (!this._isBrandedTheme) {
      this.store.select(BrandingSelectors.selectThemeColorSchema).subscribe((colorSchema) => {
        document.documentElement.style.setProperty('--primary-color', colorSchema.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', colorSchema.secondaryColor);
      });
      this.store.select(BrandingSelectors.selectIsBrandedTheme).subscribe((isBrandedTheme) => {
        this._isBrandedTheme = isBrandedTheme;
      });
      this.store.dispatch(BrandingActions.load());
      return lastValueFrom(this.store.select(BrandingSelectors.selectIsBrandedTheme));
    }
  }

  updateBranding(theme: BrandingTheme) {
    const formData = new FormData();
    const colorSchemaString = JSON.stringify(theme.colorSchema);
    formData.append('colorScheme', colorSchemaString);
    if (theme.file) {
      formData.append('name', '');
      formData.append('logo', theme.file, theme.file.name);
      formData.append('favicon', theme.file, theme.file.name);
      return this.httpClient.put<any>(`/hyperiot/ui-branding`, formData)
      .pipe(tap({
        next: () => {
          this._isBrandedTheme = true;
        }
      }));
    } else {
      return this.httpClient.patch<any>(`/hyperiot/ui-branding`, formData)
      .pipe(tap({
        next: () => {
          this._isBrandedTheme = true;
        }
      }));
    }
  }

  updateLogo(theme: BrandingTheme) {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('logo', theme.file, theme.file.name);
    formData.append('favicon', theme.file, theme.file.name);
    return this.httpClient.patch<any>(`/hyperiot/ui-branding`, formData)
    .pipe(tap({
      next: () => {
        this._isBrandedTheme = true;
      }
    }));
  }

  updateColorScheme(theme: BrandingTheme) {
    const formData = new FormData();
    const colorSchemaString = JSON.stringify(theme.colorSchema);
    formData.append('colorScheme', colorSchemaString);
    return this.httpClient.patch<any>(`/hyperiot/ui-branding`, formData)
    .pipe(tap({
      next: () => {
        this._isBrandedTheme = true;
      }
    }));
  }

  resetBranding() {
    return this.httpClient.delete(`/hyperiot/ui-branding`)
    .pipe(tap({
      next: () => {
        this._isBrandedTheme = false;
      },
    }));
  }

  getSanitizedLogo(logoBase64: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + logoBase64);
  }

}
