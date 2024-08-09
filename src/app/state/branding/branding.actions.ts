import { createAction, props } from "@ngrx/store";
import { BrandingTheme } from "src/app/services/branding/models/branding";

const load = createAction('[Branding] Load');
const update = createAction(
    '[Branding] Update',
    props<{ brandingTheme: BrandingTheme }>()
);
const reset = createAction('[Branding] Reset');

export const BrandingActions = {
    load,
    update,
    reset
};

const loadSuccess = createAction('[Branding API] Branding Load Success', props<{ payload: any }>());
const loadFailure = createAction('[Branding API] Branding Load Error', props<{ payload: any }>());
const updateSuccess = createAction('[Branding API] Branding Update Success', props<{ payload: any }>());
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