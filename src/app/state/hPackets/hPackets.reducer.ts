import { createReducer, on } from "@ngrx/store";
import { HPacket, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HPacketsActions, HPacketsApiActions } from "./hPackets.actions";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HPacketsReducer');

export const initialHPacketsState: HPacket[] = [];

const _hPacketsReducer = createReducer(
  initialHPacketsState,
  on(HPacketsActions.load, (state) => {
    logger.debug('load', state);
    return state;
  }),
  on(HPacketsActions.unset, (state) => { 
    logger.debug('unset', state);
    return initialHPacketsState;
  }),
  on(HPacketsApiActions.loadFailure, (state) => {
    logger.debug('loadFailure', state);
    return state;
  }),
  on(HPacketsApiActions.loadSuccess, (state, action) => {
    const newState = action.payload;
    logger.debug('loadSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
);
 
export function hPacketsReducer(state, action) {
  return _hPacketsReducer(state, action);
}

export const hPacketsReducerKey = 'hPackets';