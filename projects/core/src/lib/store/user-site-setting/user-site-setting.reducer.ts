import { createReducer, on } from "@ngrx/store";
import { UserSiteSettingActions } from "./user-site-setting.actions";
import { Dashboard } from "../../hyperiot-client/hyt-api/api-module/model/dashboard";

export namespace UserSiteSettingStore {

  export const key = 'userSiteSetting';

  const getUserKey = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return `${user.username}_settings`;
    } catch (error) {
      return '';
    }
  };

  const getUserSiteSettingLocalStorage = (): State | null => {
    try {
      return JSON.parse(localStorage.getItem(getUserKey())) as State;
    } catch (error) {
      return null;
    }
  };

  const setUserSiteSettingLocalStorage = (value: State) => {
    localStorage.setItem(getUserKey(), JSON.stringify(value));
  };

  export interface State {
    notificationActive?: boolean;
    defaultDashboardProjectId?: number;
    confirmDeleteWidgetIdsDismissed?: number[];
    defaultProjectsDashboardDataSource?: Dashboard.DashboardTypeEnum;
    defaultAreasDashboardDataSource?: Dashboard.DashboardTypeEnum;
    lastHdDashboardDataSource?: Dashboard.DashboardTypeEnum;
  }

  const { REALTIME } = Dashboard.DashboardTypeEnum;

  export const initialState: Readonly<State> = {
    notificationActive: true,
    defaultProjectsDashboardDataSource: REALTIME,
    defaultAreasDashboardDataSource: REALTIME,
    lastHdDashboardDataSource: REALTIME,
  };

  const _reducer = createReducer(
    initialState,
    on(UserSiteSettingActions.load, () => {
      const localStorageValue = getUserSiteSettingLocalStorage();
      if (localStorageValue) {
        return {
          ...initialState,
          ...localStorageValue
        };
      } else {
        setUserSiteSettingLocalStorage(initialState);
        return initialState;
      }
    }),
    on(UserSiteSettingActions.clear, () => {
      return initialState;
    }),
    on(UserSiteSettingActions.setAllSettings, (state, { userSiteSetting }) => {
      let newValue = userSiteSetting;
      try {
        setUserSiteSettingLocalStorage(newValue);
      } catch (error) {
        newValue = state;
      }
      return newValue;
    }),
    on(UserSiteSettingActions.updatePartialSettings, (state, { userSiteSetting }) => {
      const localStorageValue = getUserSiteSettingLocalStorage();

      let newValue = {
        ...localStorageValue,
        ...userSiteSetting,
      };

      try {
        setUserSiteSettingLocalStorage(newValue);
      } catch (error) {
        newValue = state;
      }
      return newValue;
    }),
    on(UserSiteSettingActions.updateSetting, (state, { key, value }) => {
      let newValue = {
        ...state,
        [key]: value
      };
      try {
        setUserSiteSettingLocalStorage(newValue);
      } catch (error) {
        newValue = state;
      }
      return newValue;
    }),
    on(UserSiteSettingActions.toggleNotification, (state) => {
      let newValue: State = {
        ...state,
        notificationActive: !state.notificationActive
      };
      try {
        setUserSiteSettingLocalStorage(newValue);
      } catch (error) {
        newValue = state;
      }
      return newValue;
    }),
  );

  export function reducer(state, action) {
    return _reducer(state, action);
  }

}
