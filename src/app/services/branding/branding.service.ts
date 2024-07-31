import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UiBrandingService } from 'core';
import { catchError, map, Observable, of } from 'rxjs';
import { HyperiotLogoMobilePath, HyperiotLogoPath } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {

  /* logoImagePath: SafeResourceUrl = '';
  logoMobileImagePath: SafeResourceUrl = ''; */

  logoPath$: Observable<{
    standard: SafeResourceUrl,
    mobile: SafeResourceUrl
  }>;

  constructor(
    private uiBrandingService: UiBrandingService,
    private _sanitizer: DomSanitizer
  ) {
    this.logoPath$ = this.getLogoBrand();
  }

  /* loadBranding() {
    this.uiBrandingService.getUIBranding().subscribe({
      next: ({logoBase64}) => {
        console.log('get branding response', logoBase64)
        if (logoBase64) {
          this.logoImagePath = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + logoBase64);
        } else {
          this.loadHyperiotDefaultLogo();
        }
      },
      error: (err) => {
        console.log('get branding error', err)
        this.loadHyperiotDefaultLogo();
      }
    }) 
  }
  
  loadHyperiotDefaultLogo() {
    this.logoImagePath = HyperiotLogoPath;
    this.logoMobileImagePath = HyperiotLogoMobilePath;
  } */

  getLogoBrand() {
    return this.uiBrandingService.getUIBranding().pipe(
      map(({logoBase64}) => ({
        standard: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + logoBase64),
        mobile: this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + logoBase64)
      })),
      catchError(() => of({
        standard: HyperiotLogoPath,
        mobile: HyperiotLogoMobilePath
      }))
    )
  }

}
