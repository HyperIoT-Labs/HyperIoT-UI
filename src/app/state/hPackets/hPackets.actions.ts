import { createAction, props } from "@ngrx/store";
import { HPacket } from "core";

const load = createAction('[HPackets] Load');
const unset = createAction('[HPackets] Unset');

export const HPacketsActions = {
    load,
    unset,
};

const loadSuccess = createAction('[HPackets API] HPackets Load Success', props<{ payload: HPacket[] }>());
const loadFailure = createAction('[HPackets API] HPackets Load Error', props<{ payload: any }>());
export const HPacketsApiActions = {
    loadSuccess,
    loadFailure,
};