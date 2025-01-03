import { createAction, props } from "@ngrx/store";
import { Notification } from "./notification.model";

const setNotification = createAction('[Notification/API] Set Notification', props<{ notification: Notification }>());
const deleteNotification = createAction('[Notification/API] Delete Notification', props<{ id: string }>());

export const NotificationActions = {
    setNotification,
    deleteNotification,
}