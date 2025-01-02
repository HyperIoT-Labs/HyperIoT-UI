import { createAction, props } from "@ngrx/store";
import { HDevice } from "core";

const load = createAction('[HDevices] Load');
const unset = createAction('[HDevices] Unset');

export const HDevicesActions = {
    load,
    unset,
};

const loadSuccess = createAction('[HDevices API] HDevices Load Success', props<{ payload: HDevice[] }>());
const loadFailure = createAction('[HDevices API] HDevices Load Error', props<{ payload: any }>());
export const HDevicesApiActions = {
    loadSuccess,
    loadFailure,
};