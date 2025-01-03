import { createAction, props } from '@ngrx/store';
import { Update, EntityMap, EntityMapOne, Predicate } from '@ngrx/entity';
import { HytAlarm } from 'core';

export const loadLiveAlarms = createAction('[LiveAlarm/API] Load LiveAlarms');
export const loadLiveAlarmsSuccess = createAction('[LiveAlarm/API] Load LiveAlarms Success', props<{ liveAlarms: HytAlarm.LiveAlarm[] }>());
export const loadLiveAlarmsFailure = createAction('[LiveAlarm/API] Load LiveAlarms Failure', props<{ error: any }>());

export const setLiveAlarms = createAction('[LiveAlarm/API] Set LiveAlarms', props<{ liveAlarms: HytAlarm.LiveAlarm[] }>());
export const addLiveAlarm = createAction('[LiveAlarm/API] Add LiveAlarm', props<{ liveAlarm: HytAlarm.LiveAlarm }>());
export const setLiveAlarm = createAction('[LiveAlarm/API] Set LiveAlarm', props<{ liveAlarm: HytAlarm.LiveAlarm }>());
export const upsertLiveAlarm = createAction('[LiveAlarm/API] Upsert LiveAlarm', props<{ liveAlarm: HytAlarm.LiveAlarm }>());
export const addLiveAlarms = createAction('[LiveAlarm/API] Add LiveAlarms', props<{ liveAlarms: HytAlarm.LiveAlarm[] }>());
export const upsertLiveAlarms = createAction('[LiveAlarm/API] Upsert LiveAlarms', props<{ liveAlarms: HytAlarm.LiveAlarm[] }>());
export const updateLiveAlarm = createAction('[LiveAlarm/API] Update LiveAlarm', props<{ update: Update<HytAlarm.LiveAlarm> }>());
export const updateLiveAlarms = createAction('[LiveAlarm/API] Update LiveAlarms', props<{ updates: Update<HytAlarm.LiveAlarm>[] }>());
export const mapLiveAlarm = createAction('[LiveAlarm/API] Map LiveAlarm', props<{ entityMap: EntityMapOne<HytAlarm.LiveAlarm> }>());
export const mapLiveAlarms = createAction('[LiveAlarm/API] Map LiveAlarms', props<{ entityMap: EntityMap<HytAlarm.LiveAlarm> }>());
export const deleteLiveAlarm = createAction('[LiveAlarm/API] Delete LiveAlarm', props<{ liveAlarm: HytAlarm.LiveAlarm }>());
export const deleteLiveAlarms = createAction('[LiveAlarm/API] Delete LiveAlarms', props<{ ids: number[] }>());
export const deleteLiveAlarmsByPredicate = createAction('[LiveAlarm/API] Delete LiveAlarms By Predicate', props<{ predicate: Predicate<HytAlarm.LiveAlarm> }>());
export const clearLiveAlarms = createAction('[LiveAlarm/API] Clear LiveAlarms');