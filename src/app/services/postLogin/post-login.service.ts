import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { HProject, HprojectsService } from 'core';
import { BrandingService } from '../branding/branding.service';
import { BrandingActions } from 'src/app/state/branding/branding.actions';
import { RuleActions } from 'src/app/state/rules/rules.actions';
import { HProjectActions } from 'src/app/state/hProjects/hProjects.actions';
import { HDeviceActions } from 'src/app/state/hDevices/hDevices.actions';
import { HPacketActions } from 'src/app/state/hPackets/hPackets.actions';
import { LiveAlarmActions } from 'src/app/state/live-alarms/live-alarms.actions';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {

  private _isLogged = false;

  constructor(
    private brandingService: BrandingService,
    private hProjectService: HprojectsService,
    private store: Store
  ) { }

  loadDataPostLogin() {
    if (!this._isLogged) {
      this.brandingService.loadThemeBranding();

      this.fetchProjectsDetails();

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
