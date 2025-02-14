import { createAction, props } from "@ngrx/store";
import { DataExportNotificationStore } from "./data-export-notification.reducer";

export namespace DataExportNotificationActions {
  export const setNotification = createAction('[Notification/API] Set Notification', props<{ notification: DataExportNotificationStore.DataExportNotification }>());
  export const deleteNotification = createAction('[Notification/API] Delete Notification', props<{ id: string }>());
}
