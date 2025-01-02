import { createReducer, on } from "@ngrx/store";
import { Logger, LoggerService, Rule } from "core";
import { environment } from "src/environments/environment";
import { RulesActions, RulesApiActions } from "./rules.actions";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('RulesReducer');

export const initialRulesState: Rule[] = [];

const _rulesReducer = createReducer(
  initialRulesState,
  on(RulesActions.load, (state) => {
    logger.debug('load', state);
    return state;
  }),
  on(RulesActions.unset, (state) => {
    logger.debug('unset', state);
    return initialRulesState;
  }),
  on(RulesApiActions.loadFailure, (state) => {
    logger.debug('loadFailure', state);
    return state;
  }),
  on(RulesApiActions.loadSuccess, (state, action) => {
    const newState = action.payload;
    logger.debug('loadSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
);

export function rulesReducer(state, action) {
  return _rulesReducer(state, action);
}

export const rulesReducerKey = 'rules';