import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlarmWrapperService } from 'core';
import { BrandingService } from '../branding/branding.service';
import { BrandingActions } from 'src/app/state/branding/branding.actions';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {

  private _isLogged = false;

  constructor(
    private alarmWrapperService: AlarmWrapperService,
    private brandingService: BrandingService,
    private store: Store
  ) { }

  loadDataPostLogin() {
    if (!this._isLogged) {
      this.brandingService.loadThemeBranding();
      this.alarmWrapperService.loadAndCollectAlarms();
      this._isLogged = true;
    }
  }

  actionsAtLogout() {
    this.store.dispatch(BrandingActions.unset());
    this._isLogged = false;
  }
}
