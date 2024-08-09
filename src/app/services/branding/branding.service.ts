import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UiBrandingService } from 'core';
import { BehaviorSubject, catchError, map, Observable, of, Subject, tap } from 'rxjs';
import { HyperiotLogoMobilePath, HyperiotLogoPath } from 'src/app/constants';
import { BrandingTheme } from './models/branding';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {

  private _isBrandedTheme = false;

  get isBrandedTheme() {
    return this._isBrandedTheme;
  }

  private _logoPath$ = new BehaviorSubject<{
    standard: SafeResourceUrl,
    mobile: SafeResourceUrl
  }>({
    standard: '',
    mobile: ''
  });

  get logoPath$(): Observable<{
    standard: SafeResourceUrl,
    mobile: SafeResourceUrl
  }> {
    return this._logoPath$.asObservable();
  }

  constructor(
    private uiBrandingService: UiBrandingService,
    private _sanitizer: DomSanitizer,
    private httpClient: HttpClient,
  ) {
    this.loadBranding();
  }

  loadBranding() {
    this.uiBrandingService.getUIBranding().subscribe({
      next: ({logoBase64}) => {
        this.updateLogo({
          standard: this.getSanitizedLogo(logoBase64),
          mobile: this.getSanitizedLogo(logoBase64)
        });
        this._isBrandedTheme  = true;
      },
      error: () => {
        this.resetDefaultLogo();
      }
    }) 
  }

  updateBranding(theme: BrandingTheme) {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('colorScheme', '');
    formData.append('logo', theme.file, theme.file.name);
    formData.append('favicon', theme.file, theme.file.name);
    return this.httpClient.put<any>(`/hyperiot/ui-branding`, formData)
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
        this.resetDefaultLogo();
        this._isBrandedTheme = false;
      },
    }));
  }

  updateLogo(value: {
    standard: SafeResourceUrl,
    mobile: SafeResourceUrl
  }) {
    console.log(value)
    this._logoPath$.next(value);
  }

  resetDefaultLogo() {
    this._logoPath$.next({
      standard: HyperiotLogoPath,
      mobile: HyperiotLogoMobilePath
    });
  }

  getSanitizedLogo(logoBase64: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + logoBase64);
  }

}
