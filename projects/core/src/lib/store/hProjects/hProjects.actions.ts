import { EntityMap, EntityMapOne, Predicate, Update } from "@ngrx/entity";
import { createAction, props } from "@ngrx/store";
import { HProject } from "../../hyperiot-client/hyt-api/api-module"

export namespace HProjectActions {

    export const loadHProjects = createAction('[HProject/API] Load HProjects');
    export const loadHProjectsSuccess = createAction('[HProject/API] Load HProjects Success', props<{ hProjects: HProject[] }>());
    export const loadHProjectsFailure = createAction('[HProject/API] Load HProjects Failure', props<{ error: any }>());

    export const setHProjects = createAction('[HProject/API] Set HProjects', props<{ hProjects: HProject[] }>());
    export const addHProject = createAction('[HProject/API] Add HProject', props<{ hProject: HProject }>());
    export const setHProject = createAction('[HProject/API] Set HProject', props<{ hProject: HProject }>());
    export const upsertHProject = createAction('[HProject/API] Upsert HProject', props<{ hProject: HProject }>());
    export const addHProjects = createAction('[HProject/API] Add HProjects', props<{ hProjects: HProject[] }>());
    export const upsertHProjects = createAction('[HProject/API] Upsert HProjects', props<{ hProjects: HProject[] }>());
    export const updateHProject = createAction('[HProject/API] Update HProject', props<{ update: Update<HProject> }>());
    export const updateHProjects = createAction('[HProject/API] Update HProjects', props<{ updates: Update<HProject>[] }>());
    export const mapHProject = createAction('[HProject/API] Map HProject', props<{ entityMap: EntityMapOne<HProject> }>());
    export const mapHProjects = createAction('[HProject/API] Map HProjects', props<{ entityMap: EntityMap<HProject> }>());
    export const deleteHProject = createAction('[HProject/API] Delete HProject', props<{ id: number }>());
    export const deleteHProjects = createAction('[HProject/API] Delete HProjects', props<{ ids: number[] }>());
    export const deleteHProjectsByPredicate = createAction('[HProject/API] Delete HProjects By Predicate', props<{ predicate: Predicate<HProject> }>());
    export const clearHProjects = createAction('[HProject/API] Clear HProjects');

}
