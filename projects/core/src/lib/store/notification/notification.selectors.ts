import { createFeatureSelector, createSelector } from "@ngrx/store";
import { NotificationStore } from './notification.reducer'

export namespace NotificationSelectors {

    export interface NotificationState {
        notifications: Notification[]
    }

    export const selectNotificationState = createFeatureSelector<NotificationStore.State>(NotificationStore.key);
    
    export const selectNotificationIds = createSelector(
        selectNotificationState,
        NotificationStore.selectNotificationIds // shorthand for usersState => NotificationStore.selectNotificationIds(usersState)
    );
    export const selectNotificationEntities = createSelector(
        selectNotificationState,
        NotificationStore.selectNotificationEntities
    );
    export const selectAllNotifications = createSelector(
        selectNotificationState,
        NotificationStore.selectAllNotifications
    );
    export const selectNotificationTotal = createSelector(
        selectNotificationState,
        NotificationStore.selectNotificationTotal
    );
    export const selectCurrentNotificationId = createSelector(
        selectNotificationState,
        NotificationStore.getSelectedNotificationId
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
