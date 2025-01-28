
import {
    ActionReducerMap,
} from '@ngrx/store';

import { BrandingStore } from "./branding/branding.reducer";
import { LiveAlarmStore } from './live-alarms/live-alarms.reducer';
import { NotificationStore } from './notification/notification.reducer';
import { HProjectStore } from './hProjects/hProjects.reducer';
import { HDeviceStore } from './hDevices/hDevices.reducer';
import { HPacketStore } from './hPackets/hPackets.reducer';
import { RuleStore } from './rules/rules.reducer';
import { UserSiteSettingStore } from './user-site-setting/user-site-setting.reducer';

import { BrandingEffects } from './branding';
import { RulesEffects } from './rules';
import { HProjectsEffects } from './hProjects';
import { HDevicesEffects } from './hDevices';
import { HPacketsEffects } from './hPackets';
import { LiveAlarmsEffects } from './live-alarms';
import { NotificationEffects } from './notification';

export * from './branding';
export * from './hDevices';
export * from './hPackets';
export * from './hProjects';
export * from './live-alarms';
export * from './notification';
export * from './rules';
export * from './user-site-setting';

export namespace HyperiotStore {
    export interface State {
        branding: BrandingStore.State,
        liveAlarms: LiveAlarmStore.State;
        rules: RuleStore.State,
        hProjects: HProjectStore.State,
        hDevices: HDeviceStore.State,
        hPackets: HPacketStore.State,
        notifications: NotificationStore.State,
        userSiteSetting: UserSiteSettingStore.State,
    };
      
    export const Reducers: ActionReducerMap<State> = {
        branding: BrandingStore.reducer,
        liveAlarms: LiveAlarmStore.reducer,
        rules: RuleStore.reducer,
        hProjects: HProjectStore.reducer,
        hDevices: HDeviceStore.reducer,
        hPackets: HPacketStore.reducer,
        notifications: NotificationStore.reducer,
        userSiteSetting: UserSiteSettingStore.reducer,
    };
    
    export const Effects = [
        BrandingEffects,
        RulesEffects,
        HProjectsEffects,
        HDevicesEffects,
        HPacketsEffects,
        LiveAlarmsEffects,
        NotificationEffects
    ];
}
