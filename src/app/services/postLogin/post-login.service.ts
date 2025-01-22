import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BrandingActions, BrandingService, HDeviceActions, HPacketActions, HProject, HProjectActions, HProjectService, LiveAlarmActions, RuleActions, UserSiteSettingActions } from 'core';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {

  private _isLogged = false;

  constructor(
    private brandingService: BrandingService,
    private hProjectService: HProjectService,
    private store: Store
  ) { }

  loadDataPostLogin() {
    if (!this._isLogged) {
      this.brandingService.loadThemeBranding();

      this.fetchProjectsDetails();
      this.store.dispatch(UserSiteSettingActions.load());

      this.store.dispatch(RuleActions.loadRules());
      this._isLogged = true;
    }
  }

  actionsAtLogout() {
    this.store.dispatch(BrandingActions.unset());
    this.store.dispatch(HProjectActions.clearHProjects());
    this.store.dispatch(HDeviceActions.clearHDevices());
    this.store.dispatch(HPacketActions.clearHPackets());
    this.store.dispatch(RuleActions.clearRules());
    this.store.dispatch(LiveAlarmActions.clearLiveAlarms());
    this.store.dispatch(UserSiteSettingActions.clear());
    this._isLogged = false;
  }

  fetchProjectsDetails() {
    this.hProjectService.findHProjectsDetails().subscribe(
      (res: HProject[]) => {
        let allDevices = [];
        let allPackets = [];
        const hProjects = res.map(project => {
          const devices = project.devices.map(device => {
            const packets = device.packets.map(packet => ({
              ...packet,
              device: {
                ...device,
                project: undefined,
                packets: undefined
              }
            }));
            allPackets = allPackets.concat(packets);
            return {
              ...device,
              project: {
                ...project,
                devices: undefined
              },
              packets: undefined
            }
          });
          allDevices = allDevices.concat(devices);
          return {
            ...project,
            devices: undefined
          };
        });
        this.store.dispatch(HProjectActions.loadHProjectsSuccess({ hProjects }));
        this.store.dispatch(HDeviceActions.loadHDevicesSuccess({ hDevices: allDevices }));
        this.store.dispatch(HPacketActions.loadHPacketsSuccess({ hPackets: allPackets }));

        this.store.dispatch(LiveAlarmActions.loadLiveAlarms());

      }
    )
  }
}
