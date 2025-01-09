import { createAction, props } from "@ngrx/store";
import { NotificationStore } from "./notification.reducer";

export namespace NotificationActions {

    export const setNotification = createAction('[Notification/API] Set Notification', props<{ notification: NotificationStore.Notification }>());
    export const deleteNotification = createAction('[Notification/API] Delete Notification', props<{ id: string }>());
    
}
