import { createReducer, on } from "@ngrx/store";
import { BrandingActions } from "./branding.actions";


export const initialState = {};
 
const _brandingReducer = createReducer(
  initialState,
  on(BrandingActions.update, (state) => state),
  on(BrandingActions.reset, (state) => initialState)
);
 
export function brandingReducer(state, action) {
  return _brandingReducer(state, action);
}