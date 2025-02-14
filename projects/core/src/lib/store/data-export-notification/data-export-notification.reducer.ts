import { createReducer, on } from "@ngrx/store";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { DataExportNotificationActions } from "./data-export-notification.actions";

export namespace DataExportNotificationStore {

  export const key = 'dataExportNotification';

  export interface DataExportNotification {
    id: string;
    title: string;
    message: string;
    color: string;
    bgColor: string;
    image: string;
  }

  const adapter: EntityAdapter<DataExportNotification> = createEntityAdapter<DataExportNotification>();

  export interface State extends EntityState<DataExportNotification> {
    // additional entities state properties
    selectedNotificationId: string | null;
  }

  const initialState: State = adapter.getInitialState({
    // additional entity state properties
    selectedNotificationId: null,
  });

  export const reducer = createReducer(
    initialState,
    on(DataExportNotificationActions.setNotification, (state, { notification }) => {
      return adapter.setOne(notification, state)
    }),
    on(DataExportNotificationActions.deleteNotification, (state, { id }) => {
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

}
