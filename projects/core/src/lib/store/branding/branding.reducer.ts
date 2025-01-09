import { createReducer, on } from "@ngrx/store";
import { BrandingActions } from "./branding.actions";
import { HyperiotLogoMobilePath, HyperiotLogoPath } from "../../constants";
import { SafeResourceUrl } from "@angular/platform-browser";

export namespace BrandingStore {

  export const key = 'branding';

  export interface State {
      colorSchema: {
        primaryColor: string;
        secondaryColor: string;
      };
      logo: {
        standard: SafeResourceUrl | string;
        mobile: SafeResourceUrl | string;
      },
      isBrandedTheme: boolean;
      error?: {
        action: string,
        payload: any
      }
  };

  const initialState: State = {
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
  
  const _reducer = createReducer(
    initialState,
    on(BrandingActions.load, (state) => {
      return state;
    }),
    on(BrandingActions.updateAll, (state) => {
      return state;
    }),
    on(BrandingActions.reset, (state) => {
      return state;
    }),
    on(BrandingActions.unset, (state) => {
      return initialState;
    }),
    on(BrandingActions.loadFailure, (state) => {
      return state;
    }),
    on(BrandingActions.loadSuccess, (state, action) => {
      const newState = {...state, ...action.payload};
      return newState;
    }),
    on(BrandingActions.updateFailure, (state, action) => {
      const newState = {...state, error: {
        action: action.type,
        payload: action.payload
      }};
      return newState;
    }),
    on(BrandingActions.updateSuccess, (state, action) => {
      const newState = {...state, ...action.payload};
      return newState;
    }),
    on(BrandingActions.resetFailure, (state, action) => {
      const newState = {...state, error: {
        action: action.type,
        payload: action.payload
      }};
      return newState;
    }),
    on(BrandingActions.resetSuccess, (state) => {
      return initialState;
    }),
  );
   
  export function reducer(state, action) {
    return _reducer(state, action);
  }

}
