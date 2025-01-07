import {
    createSelector,
    createFeatureSelector,
} from '@ngrx/store';
import * as fromLiveAlarm from './live-alarms.reducer';

export const selectLiveAlarmState = createFeatureSelector<fromLiveAlarm.State>(fromLiveAlarm.liveAlarmReducerKey);
  
export const selectLiveAlarmIds = createSelector(
  selectLiveAlarmState,
  fromLiveAlarm.selectLiveAlarmIds // shorthand for usersState => fromLiveAlarm.selectLiveAlarmIds(usersState)
);
export const selectLiveAlarmEntities = createSelector(
  selectLiveAlarmState,
  fromLiveAlarm.selectLiveAlarmEntities
);
export const selectAllLiveAlarms = createSelector(
  selectLiveAlarmState,
  fromLiveAlarm.selectAllLiveAlarms
);
export const selectLiveAlarmTotal = createSelector(
  selectLiveAlarmState,
  fromLiveAlarm.selectLiveAlarmTotal
);
export const selectCurrentLiveAlarmId = createSelector(
  selectLiveAlarmState,
  fromLiveAlarm.getSelectedLiveAlarmId
);

export const selectCurrentLiveAlarm = createSelector(
  selectLiveAlarmEntities,
  selectCurrentLiveAlarmId,
  (alarmEnetities, userId) => userId && alarmEnetities[userId]
);

export const selectLiveAlarmById = (props: {id: number}) => createSelector(
  selectLiveAlarmEntities,
  (liveAlarmEnetities) => props.id && liveAlarmEnetities[props.id]
);

export const LiveAlarmSelectors = {
  selectLiveAlarmState,
  selectLiveAlarmIds,
  selectLiveAlarmEntities,
  selectAllLiveAlarms,
  selectLiveAlarmTotal,
  selectCurrentLiveAlarmId,
  selectCurrentLiveAlarm,
  selectLiveAlarmById,
};
