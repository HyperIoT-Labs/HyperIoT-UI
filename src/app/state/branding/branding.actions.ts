import { createAction, props } from "@ngrx/store";
import { BrandingTheme } from "src/app/services/branding/models/branding";
import { BrandingState } from "./branding.model";

const load = createAction('[Branding] Load');
const updateAll = createAction(
    '[Branding] Update',
    props<{ brandingTheme: BrandingTheme }>()
);
const updateLogo = createAction(
    '[Branding] Update Logo',
    props<{ brandingTheme: BrandingTheme }>()
);
const updateColorSchema = createAction(
    '[Branding] Update ColorScheme',
    props<{ brandingTheme: BrandingTheme }>()
);
const reset = createAction('[Branding] Reset');

export const BrandingActions = {
    load,
    updateAll,
    updateLogo,
    updateColorSchema,
    reset
};

const loadSuccess = createAction('[Branding API] Branding Load Success', props<{ payload: BrandingState }>());
const loadFailure = createAction('[Branding API] Branding Load Error', props<{ payload: any }>());
const updateSuccess = createAction('[Branding API] Branding Update Success', props<{ payload: BrandingState }>());
const updateFailure = createAction('[Branding API] Branding Update Error', props<{ payload: any }>());
const resetSuccess = createAction('[Branding API] Branding Reset Success', props<{ payload: any }>());
const resetFailure = createAction('[Branding API] Branding Reset Error', props<{ payload: any }>());

export const BrandingApiActions = {
    loadSuccess,
    loadFailure,
    updateSuccess,
    updateFailure,
    resetSuccess,
    resetFailure
};