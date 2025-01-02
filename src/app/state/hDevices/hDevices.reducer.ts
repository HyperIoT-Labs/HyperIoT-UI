import { createReducer, on } from "@ngrx/store";
import { HDevice, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HDevicesActions, HDevicesApiActions } from "./hDevices.actions";
import { HPacketsApiActions } from "../hPackets/hPackets.actions";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HDevicesReducer');

export const initialHDevicesState: HDevice[] = [];

const _hDevicesReducer = createReducer(
  initialHDevicesState,

  on(HDevicesActions.load, (state) => {
    logger.debug('load', state);
    return state;
  }),
  on(HDevicesActions.unset, (state) => { 
    logger.debug('unset', state);
    return initialHDevicesState;
  }),
  on(HDevicesApiActions.loadFailure, (state) => {
    logger.debug('loadFailure', state);
    return state;
  }),
  on(HDevicesApiActions.loadSuccess, (state, action) => {
    const newState = action.payload;
    logger.debug('loadSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
);
 
export function hDevicesReducer(state, action) {
  return _hDevicesReducer(state, action);
}

export const hDevicesReducerKey = 'hDevices';