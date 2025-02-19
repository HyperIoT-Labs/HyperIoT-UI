import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DataExportNotificationStore } from './data-export-notification.reducer'

export namespace DataExportNotificationSelectors {

  export interface DataExportNotification extends Notification {
    data: {
      exportId: string;
      fullFileName: string;
      exportName: string,
      hProjectId: number;
      hPacketId: number;
      hPacketFormat: string,
      startTime: number,
      endTime: number,
    }
    //   title: string;
    //   message: string;
    //   color: string;
    //   bgColor: string;
    //   image: string;
  }

  export interface DataExportNotificationState {
    notifications: DataExportNotification[];
  }

  export const selectNotificationState = createFeatureSelector<DataExportNotificationStore.State>(DataExportNotificationStore.key);

  export const selectNotificationIds = createSelector(
    selectNotificationState,
    DataExportNotificationStore.selectNotificationIds // shorthand for usersState => NotificationStore.selectNotificationIds(usersState)
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
