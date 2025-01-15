import { createSelector } from '@ngrx/store';
import { BrandingStore } from './branding.reducer';
import { HyperiotStore } from '..';

export namespace BrandingSelectors {

  export const selectThemeBranding = (state: HyperiotStore.State) => state.branding;
 
  export const selectThemeColorSchema = createSelector(
      selectThemeBranding,
      (state: BrandingStore.State) => state.colorSchema
  );
  
  export const selectThemeLogoPath = createSelector(
      selectThemeBranding,
      (state: BrandingStore.State) => state.logo
  );
  
  export const selectError = createSelector(
    selectThemeBranding,
    (state: BrandingStore.State) => state.error
  );
  
  export const selectIsBrandedTheme = createSelector(
    selectThemeBranding,
    (state: BrandingStore.State) => state.isBrandedTheme
  );
  
}
 