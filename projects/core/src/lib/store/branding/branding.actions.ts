import { createAction, props } from "@ngrx/store";
import { BrandingTheme } from "../../models/branding";
import { BrandingStore } from "./branding.reducer";

export namespace BrandingActions {
    export const load = createAction('[Branding] Load');
    export const updateAll = createAction(
        '[Branding] Update',
        props<{ brandingTheme: BrandingTheme }>()
    );
    export const updateLogo = createAction(
        '[Branding] Update Logo',
        props<{ brandingTheme: BrandingTheme }>()
    );
    export const updateColorSchema = createAction(
        '[Branding] Update ColorScheme',
        props<{ brandingTheme: BrandingTheme }>()
    );
    export const reset = createAction('[Branding] Reset');
    export const unset = createAction('[Branding] Unset after logout');

    export const loadSuccess = createAction('[Branding API] Branding Load Success', props<{ payload: BrandingStore.State }>());
    export const loadFailure = createAction('[Branding API] Branding Load Error', props<{ payload: any }>());
    export const updateSuccess = createAction('[Branding API] Branding Update Success', props<{ payload: BrandingStore.State }>());
    export const updateFailure = createAction('[Branding API] Branding Update Error', props<{ payload: any }>());
    export const resetSuccess = createAction('[Branding API] Branding Reset Success', props<{ payload: any }>());
    export const resetFailure = createAction('[Branding API] Branding Reset Error', props<{ payload: any }>());

}
