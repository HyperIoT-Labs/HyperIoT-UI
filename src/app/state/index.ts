import {
    ActionReducerMap,
} from '@ngrx/store';

import { brandingReducer } from "./branding/branding.reducer";
import { BrandingState } from './branding/branding.model';

import * as fromLiveAlarm from './live-alarms/live-alarms.reducer';
import * as fromNotification from './notification/notification.reducer';
import * as fromHProject from './hProjects/hProjects.reducer';
import * as fromHDevice from './hDevices/hDevices.reducer';
import * as fromHPacket from './hPackets/hPackets.reducer';
import * as fromRule from './rules/rules.reducer';

import { BrandingEffects } from './branding/branding.effects';
import { RulesEffects } from './rules/rules.effects';
import { HProjectsEffects } from './hProjects/hProjects.effects';
import { HDevicesEffects } from './hDevices/hDevices.effects';
import { HPacketsEffects } from './hPackets/hPackets.effects';
import { LiveAlarmsEffects } from './live-alarms/live-alarms.effects';
import { NotificationEffects } from './notification/notification.effects';


  
export interface State {
    liveAlarms: fromLiveAlarm.State;
    branding: BrandingState,
    rules: fromRule.State,
    hProjects: fromHProject.State,
    hDevices: fromHDevice.State,
    hPackets: fromHPacket.State,
    notifications: fromNotification.State
}
  
export const reducers: ActionReducerMap<State> = {
    liveAlarms: fromLiveAlarm.reducer,
    branding: brandingReducer,
    rules: fromRule.reducer,
    hProjects: fromHProject.reducer,
    hDevices: fromHDevice.reducer,
    hPackets: fromHPacket.reducer,
    notifications: fromNotification.reducer,
};

export const effects = [
    BrandingEffects,
    RulesEffects,
    HProjectsEffects,
    HDevicesEffects,
    HPacketsEffects,
    LiveAlarmsEffects,
    NotificationEffects
]
