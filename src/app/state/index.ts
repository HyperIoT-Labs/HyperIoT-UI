import {
    ActionReducerMap,
} from '@ngrx/store';
import * as fromLiveAlarm from './live-alarms/live-alarms.reducer';

import { brandingReducer } from "./branding/branding.reducer";
import { hDevicesReducer } from "./hDevices/hDevices.reducer";
import { hPacketsReducer } from "./hPackets/hPackets.reducer";
import { hProjectsReducer } from "./hProjects/hProjects.reducer";
import { rulesReducer } from "./rules/rules.reducer";

import { BrandingState } from './branding/branding.model';
import { HDevice, HPacket, HProject, Rule } from 'core';
import * as fromNotification from './notification/notification.reducer';
import { Notification } from './notification/notification.model';

  
export interface State {
    liveAlarms: fromLiveAlarm.State;
    branding: BrandingState,
    rules: Rule[],
    hProjects: HProject[],
    hDevices: HDevice[],
    hPackets: HPacket[],
    notifications: fromNotification.State
}
  
export const reducers: ActionReducerMap<State> = {
    liveAlarms: fromLiveAlarm.reducer,
    branding: brandingReducer,
    rules: rulesReducer,
    hProjects: hProjectsReducer,
    hDevices: hDevicesReducer,
    hPackets: hPacketsReducer,
    notifications: fromNotification.reducer,
};
  
