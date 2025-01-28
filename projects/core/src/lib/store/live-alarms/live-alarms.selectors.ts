import {
    createSelector,
    createFeatureSelector,
} from '@ngrx/store';
import { LiveAlarmStore } from './live-alarms.reducer';

export namespace LiveAlarmSelectors {

  export const selectLiveAlarmState = createFeatureSelector<LiveAlarmStore.State>(LiveAlarmStore.key);
    
  export const selectLiveAlarmIds = createSelector(
    selectLiveAlarmState,
    LiveAlarmStore.selectLiveAlarmIds // shorthand for usersState => LiveAlarmStore.selectLiveAlarmIds(usersState)
  );
  export const selectLiveAlarmEntities = createSelector(
    selectLiveAlarmState,
    LiveAlarmStore.selectLiveAlarmEntities
  );
  export const selectAllLiveAlarms = createSelector(
    selectLiveAlarmState,
    LiveAlarmStore.selectAllLiveAlarms
  );
  export const selectLiveAlarmTotal = createSelector(
    selectLiveAlarmState,
    LiveAlarmStore.selectLiveAlarmTotal
  );
  export const selectCurrentLiveAlarmId = createSelector(
    selectLiveAlarmState,
    LiveAlarmStore.getSelectedLiveAlarmId
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

  export const selectLiveAlarmsByProjectId = (props: {projectId: number}) => createSelector(
    selectAllLiveAlarms,
    (allLiveAlarms) => allLiveAlarms.filter(alarm => alarm.projectId === props.projectId)
  )

}
