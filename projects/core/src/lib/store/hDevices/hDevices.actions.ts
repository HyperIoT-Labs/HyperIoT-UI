import { EntityMap, EntityMapOne, Predicate, Update } from "@ngrx/entity";
import { createAction, props } from "@ngrx/store";
import { HDevice } from "../../hyperiot-client/models/hDevice";

export namespace HDeviceActions {
    export const loadHDevices = createAction('[HDevice/API] Load HDevices');
    export const loadHDevicesSuccess = createAction('[HDevice/API] Load HDevices Success', props<{ hDevices: HDevice[] }>());
    export const loadHDevicesFailure = createAction('[HDevice/API] Load HDevices Failure', props<{ error: any }>());

    export const setHDevices = createAction('[HDevice/API] Set HDevices', props<{ hDevices: HDevice[] }>());
    export const addHDevice = createAction('[HDevice/API] Add HDevice', props<{ hDevice: HDevice }>());
    export const setHDevice = createAction('[HDevice/API] Set HDevice', props<{ hDevice: HDevice }>());
    export const upsertHDevice = createAction('[HDevice/API] Upsert HDevice', props<{ hDevice: HDevice }>());
    export const addHDevices = createAction('[HDevice/API] Add HDevices', props<{ hDevices: HDevice[] }>());
    export const upsertHDevices = createAction('[HDevice/API] Upsert HDevices', props<{ hDevices: HDevice[] }>());
    export const updateHDevice = createAction('[HDevice/API] Update HDevice', props<{ update: Update<HDevice> }>());
    export const updateHDevices = createAction('[HDevice/API] Update HDevices', props<{ updates: Update<HDevice>[] }>());
    export const mapHDevice = createAction('[HDevice/API] Map HDevice', props<{ entityMap: EntityMapOne<HDevice> }>());
    export const mapHDevices = createAction('[HDevice/API] Map HDevices', props<{ entityMap: EntityMap<HDevice> }>());
    export const deleteHDevice = createAction('[HDevice/API] Delete HDevice', props<{ id: number }>());
    export const deleteHDevices = createAction('[HDevice/API] Delete HDevices', props<{ ids: number[] }>());
    export const deleteHDevicesByPredicate = createAction('[HDevice/API] Delete HDevices By Predicate', props<{ predicate: Predicate<HDevice> }>());
    export const clearHDevices = createAction('[HDevice/API] Clear HDevices');    
}
