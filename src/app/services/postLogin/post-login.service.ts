import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlarmWrapperService, HProject, HprojectsService } from 'core';
import { BrandingService } from '../branding/branding.service';
import { BrandingActions } from 'src/app/state/branding/branding.actions';
import { RulesActions } from 'src/app/state/rules/rules.actions';
import { HProjectsActions, HProjectsApiActions } from 'src/app/state/hProjects/hProjects.actions';
import { HDevicesActions, HDevicesApiActions } from 'src/app/state/hDevices/hDevices.actions';
import { HPacketsActions, HPacketsApiActions } from 'src/app/state/hPackets/hPackets.actions';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {

  private _isLogged = false;

  constructor(
    private alarmWrapperService: AlarmWrapperService,
    private brandingService: BrandingService,
    private hProjectService: HprojectsService,
    private store: Store
  ) { }

  loadDataPostLogin() {
    if (!this._isLogged) {
      this.brandingService.loadThemeBranding();

      this.fetchProjectsDetails();

      this.store.dispatch(RulesActions.load());
      this._isLogged = true;
    }
  }

  actionsAtLogout() {
    this.store.dispatch(BrandingActions.unset());
    this.store.dispatch(HProjectsActions.unset());
    this.store.dispatch(HDevicesActions.unset());
    this.store.dispatch(HPacketsActions.unset());
    this.store.dispatch(RulesActions.unset());
    this._isLogged = false;
  }

  fetchProjectsDetails() {
    this.hProjectService.findHProjectsDetails().subscribe(
      (res: HProject[]) => {
        this.store.dispatch(HProjectsApiActions.loadSuccess({ payload: res }));
        let allDevices = [];
        let allPackets = [];
        res.forEach(project => {
          project.devices.forEach(device => {
            allPackets = allPackets.concat(device.packets);
          });
          allDevices = allDevices.concat(project.devices);
        });
        this.store.dispatch(HDevicesApiActions.loadSuccess({ payload: allDevices }));
        this.store.dispatch(HPacketsApiActions.loadSuccess({ payload: allPackets }));
      }
    )
  }
}
