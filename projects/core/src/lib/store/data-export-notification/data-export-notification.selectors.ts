import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DataExportNotificationStore } from './data-export-notification.reducer';

export namespace DataExportNotificationSelectors {

  export interface DataExportNotificationState {
    notifications: DataExportNotificationStore.DataExportNotification[];
  }

  export const selectNotificationState = createFeatureSelector<DataExportNotificationStore.State>(DataExportNotificationStore.key);

  export const selectNotificationIds = createSelector(
    selectNotificationState,
    DataExportNotificationStore.selectNotificationIds
  );
  export const selectNotificationEntities = createSelector(
    selectNotificationState,
    DataExportNotificationStore.selectNotificationEntities
  );
  export const selectAllNotifications = createSelector(
    selectNotificationState,
    DataExportNotificationStore.selectAllNotifications
  );
  export const selectNotificationTotal = createSelector(
    selectNotificationState,
    DataExportNotificationStore.selectNotificationTotal
  );
  export const selectCurrentNotificationId = createSelector(
    selectNotificationState,
    DataExportNotificationStore.getSelectedNotificationId
  );

  export const selectLastNotification = createSelector(
    selectAllNotifications,
    (state) => {
      if (state.length) {
        return state[state.length - 1];
      }
    },
  );

}
