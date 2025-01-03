import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as LiveAlarmActions from './live-alarms.actions';
import { HytAlarm } from 'core';

export interface State extends EntityState<HytAlarm.LiveAlarm> {
  // additional entities state properties
  selectedLiveAlarmId: string | null;
}

export function selectLiveAlarmId(a: HytAlarm.LiveAlarm): number {
  //In this case this would be optional since primary key is id
  return a.alarmId;
}

export const adapter: EntityAdapter<HytAlarm.LiveAlarm> = createEntityAdapter<HytAlarm.LiveAlarm>({
  selectId: selectLiveAlarmId
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedLiveAlarmId: null,
});

export const reducer = createReducer(
  initialState,
  on(LiveAlarmActions.loadLiveAlarms, (state) => {
    return { ...state };
  }),
  on(LiveAlarmActions.loadLiveAlarmsSuccess, (state, { liveAlarms }) => {
    return adapter.setAll(liveAlarms, state);
  }),
  on(LiveAlarmActions.loadLiveAlarmsFailure, (state, { error }) => {
    return { ...state };
  }),
  on(LiveAlarmActions.addLiveAlarm, (state, { liveAlarm }) => {
    return adapter.addOne(liveAlarm, state)
  }),
  on(LiveAlarmActions.setLiveAlarm, (state, { liveAlarm }) => {
    return adapter.setOne(liveAlarm, state)
  }),
  on(LiveAlarmActions.upsertLiveAlarm, (state, { liveAlarm }) => {
    return adapter.upsertOne(liveAlarm, state);
  }),
  on(LiveAlarmActions.addLiveAlarms, (state, { liveAlarms }) => {
    return adapter.addMany(liveAlarms, state);
  }),
  on(LiveAlarmActions.upsertLiveAlarms, (state, { liveAlarms }) => {
    return adapter.upsertMany(liveAlarms, state);
  }),
  on(LiveAlarmActions.updateLiveAlarm, (state, { update }) => {
    return adapter.updateOne(update, state);
  }),
  on(LiveAlarmActions.updateLiveAlarms, (state, { updates }) => {
    return adapter.updateMany(updates, state);
  }),
  on(LiveAlarmActions.mapLiveAlarm, (state, { entityMap }) => {
    return adapter.mapOne(entityMap, state);
  }),
  on(LiveAlarmActions.mapLiveAlarms, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(LiveAlarmActions.deleteLiveAlarm, (state, { liveAlarm }) => {
    return adapter.removeOne(liveAlarm.alarmId, state);
  }),
  on(LiveAlarmActions.deleteLiveAlarms, (state, { ids }) => {
    return adapter.removeMany(ids, state);
  }),
  on(LiveAlarmActions.deleteLiveAlarmsByPredicate, (state, { predicate }) => {
    return adapter.removeMany(predicate, state);
  }),
  on(LiveAlarmActions.setLiveAlarms, (state, { liveAlarms }) => {
    return adapter.setMany(liveAlarms, state);
  }),
  on(LiveAlarmActions.clearLiveAlarms, state => {
    return adapter.removeAll({ ...state, selectedLiveAlarmId: null });
  })
);


export const getSelectedLiveAlarmId = (state: State) => state.selectedLiveAlarmId;

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of liveAlarm ids
export const selectLiveAlarmIds = selectIds;

// select the dictionary of liveAlarm entities
export const selectLiveAlarmEntities = selectEntities;

// select the array of liveAlarms
export const selectAllLiveAlarms = selectAll;

// select the total liveAlarm count
export const selectLiveAlarmTotal = selectTotal;