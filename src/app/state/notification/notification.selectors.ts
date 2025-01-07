import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Notification } from "./notification.model";
import * as fromNotification from './notification.reducer'

export interface NotificationState {
    notifications: Notification[]
}

const selectNotificationState = createFeatureSelector<fromNotification.State>(fromNotification.notificationReducerKey);
  
const selectNotificationIds = createSelector(
    selectNotificationState,
    fromNotification.selectNotificationIds // shorthand for usersState => fromNotification.selectNotificationIds(usersState)
);
const selectNotificationEntities = createSelector(
    selectNotificationState,
    fromNotification.selectNotificationEntities
);
const selectAllNotifications = createSelector(
    selectNotificationState,
    fromNotification.selectAllNotifications
);
const selectNotificationTotal = createSelector(
    selectNotificationState,
    fromNotification.selectNotificationTotal
);
const selectCurrentNotificationId = createSelector(
    selectNotificationState,
    fromNotification.getSelectedNotificationId
);

const selectLastNotification = createSelector(
    selectAllNotifications,
    (state) => state.length ? state[state.length - 1] : null,
);

export const NotificationSelectors = {
    selectNotificationState,
    selectNotificationIds,
    selectNotificationEntities,
    selectAllNotifications,
    selectNotificationTotal,
    selectCurrentNotificationId,
    selectLastNotification,
}