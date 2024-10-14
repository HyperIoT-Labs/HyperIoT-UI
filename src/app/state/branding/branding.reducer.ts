import { createReducer, on } from "@ngrx/store";
import { BrandingActions, BrandingApiActions } from "./branding.actions";
import { HyperiotLogoMobilePath, HyperiotLogoPath } from "src/app/constants";
import { BrandingState } from "./branding.model";
import { Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('BrandingReducer');

export const initialBrandingState: BrandingState = {
  colorSchema: {
    primaryColor: '#0956B6',
    secondaryColor: '#17a4fa'
  },
  logo: {
    standard: HyperiotLogoPath, 
    mobile: HyperiotLogoMobilePath,
  },
  isBrandedTheme: false
};

const _brandingReducer = createReducer(
  initialBrandingState,
  on(BrandingActions.load, (state) => {
    logger.debug('load', state);
    return state;
  }),
  on(BrandingActions.updateAll, (state) => {
    logger.debug('update', state);
    return state;
  }),
  on(BrandingActions.reset, (state) => { 
    logger.debug('reset', state);
    return state;
  }),
  on(BrandingActions.unset, (state) => { 
    logger.debug('unset', state);
    return initialBrandingState;
  }),
  on(BrandingApiActions.loadFailure, (state) => {
    logger.debug('loadFailure', state);
    return state;
  }),
  on(BrandingApiActions.loadSuccess, (state, action) => {
    const newState = {...state, ...action.payload};
    logger.debug('loadSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
  on(BrandingApiActions.updateFailure, (state, action) => {
    const newState = {...state, error: {
      action: action.type,
      payload: action.payload
    }};
    logger.debug('updateFailure old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
  on(BrandingApiActions.updateSuccess, (state, action) => {
    const newState = {...state, ...action.payload};
    logger.debug('updateSuccess old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
  on(BrandingApiActions.resetFailure, (state, action) => {
    const newState = {...state, error: {
      action: action.type,
      payload: action.payload
    }};
    logger.debug('resetFailure old state:', state, '- action:', action, '- new state:', newState);
    return newState;
  }),
  on(BrandingApiActions.resetSuccess, (state) => {
    logger.debug('resetSuccess old state:', state, '- new state:', initialBrandingState);
    return initialBrandingState;
  }),
);
 
export function brandingReducer(state, action) {
  return _brandingReducer(state, action);
}

export const brandingReducerKey = 'branding';