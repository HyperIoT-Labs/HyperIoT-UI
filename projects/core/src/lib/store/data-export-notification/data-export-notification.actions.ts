import { createAction, props } from "@ngrx/store";
import { DataExportNotificationStore } from "./data-export-notification.reducer";
import { Update } from "@ngrx/entity";

export namespace DataExportNotificationActions {
  export const setNotification = createAction('[DataExportNotification/API] Set Notification', props<{ notification: DataExportNotificationStore.DataExportNotification }>());
  export const deleteNotification = createAction('[DataExportNotification/API] Delete Notification', props<{ id: string }>());
  export const updateNotification = createAction('[DataExportNotification/API] Update Notification', props<{ update: Update<DataExportNotificationStore.DataExportNotification > }>());
  export const addOrUpdateNotification = createAction('[DataExportNotification/API] Add Or Update Notification', props<{ notification: DataExportNotificationStore.DataExportNotification }>());
}
