import { createSelector } from '@ngrx/store';
import { BrandingState } from './branding.model';

interface AppState {
  branding: BrandingState;
}
 
const selectThemeBranding = (state: AppState) => state.branding;
 
const selectThemeColorSchema = createSelector(
    selectThemeBranding,
    (state: BrandingState) => state.colorSchema
);

const selectThemeLogoPath = createSelector(
    selectThemeBranding,
    (state: BrandingState) => state.logo
);

const selectError = createSelector(
  selectThemeBranding,
  (state: BrandingState) => state.error
);

const selectIsBrandedTheme = createSelector(
  selectThemeBranding,
  (state: BrandingState) => state.isBrandedTheme
);

export const BrandingSelectors = {
  selectThemeBranding,
  selectThemeColorSchema,
  selectThemeLogoPath,
  selectError,
  selectIsBrandedTheme
}