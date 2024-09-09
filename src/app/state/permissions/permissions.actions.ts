import { createAction } from "@ngrx/store";

const load = createAction('[Permissions] Load');
const update = createAction('[Permissions] Update');

export const PermissionsActions = {
    load,
    update
};