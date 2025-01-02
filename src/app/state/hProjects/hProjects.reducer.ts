import { createReducer, on, Store } from "@ngrx/store";
import { HProject, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HProjectsActions, HProjectsApiActions } from "./hProjects.actions";
import { HDevicesActions, HDevicesApiActions } from "../hDevices/hDevices.actions";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HProjectsReducer');

export const initialHProjectsState: HProject[] = [];

const _hProjectsReducer = createReducer(
  initialHProjectsState,
  on(HProjectsActions.load, (state) => {
    logger.debug('load', state);
    return state;
  }),
  on(HProjectsActions.unset, (state) => { 
    logger.debug('unset', state);
    return initialHProjectsState;
  }),
  on(HProjectsApiActions.loadFailure, (state) => {
    logger.debug('loadFailure', state);
    return state;
  }),
  on(HProjectsApiActions.loadSuccess, (state, action) => {
    const newState = action.payload;
    logger.debug('loadSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
);

export function hProjectsReducer(state, action) {
  return _hProjectsReducer(state, action);
}

export const hProjectsReducerKey = 'hProjects';