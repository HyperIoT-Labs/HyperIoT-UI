import { createReducer, on } from "@ngrx/store";
import { NotificationActions } from "./notification.actions";
import { Notification } from "./notification.model";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";

export interface State extends EntityState<Notification> {
    // additional entities state properties
    selectedNotificationId: string | null;
}

export const adapter: EntityAdapter<Notification> = createEntityAdapter<Notification>();

export const initialState: State = adapter.getInitialState({
    // additional entity state properties
    selectedNotificationId: null,
});

export const reducer = createReducer(
    initialState,
    on(NotificationActions.setNotification, (state, { notification }) => {
        return adapter.setOne(notification, state)
    }),
    on(NotificationActions.deleteNotification, (state, { id }) => {
        return adapter.removeOne(id, state)
    }),
)

export const getSelectedNotificationId = (state: State) => state.selectedNotificationId;

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of notification ids
export const selectNotificationIds = selectIds;

// select the dictionary of notification entities
export const selectNotificationEntities = selectEntities;

// select the array of notifications
export const selectAllNotifications = selectAll;

// select the total notification count
export const selectNotificationTotal = selectTotal;

export const notificationReducerKey = 'notifications';
