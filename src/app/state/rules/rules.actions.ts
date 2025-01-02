import { createAction, props } from "@ngrx/store";
import { Rule } from "core";

const load = createAction('[Rule] Load');
const unset = createAction('[Rule] Unset');

export const RulesActions = {
    load,
    unset,
};

const loadSuccess = createAction('[Rule API] Rule Load Success', props<{ payload: Rule[] }>());
const loadFailure = createAction('[Rule API] Rule Load Error', props<{ payload: any }>());
export const RulesApiActions = {
    loadSuccess,
    loadFailure,
};