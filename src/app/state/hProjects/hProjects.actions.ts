import { createAction, props } from "@ngrx/store";
import { HProject } from "core";

const load = createAction('[HProjects] Load');
const unset = createAction('[HProjects] Unset');

export const HProjectsActions = {
    load,
    unset,
};

const loadSuccess = createAction('[HProjects API] HProjects Load Success', props<{ payload: HProject[] }>());
const loadFailure = createAction('[HProjects API] HProjects Load Error', props<{ payload: any }>());
export const HProjectsApiActions = {
    loadSuccess,
    loadFailure,
};