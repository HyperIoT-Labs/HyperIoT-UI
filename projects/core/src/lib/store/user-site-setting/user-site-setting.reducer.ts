import { createReducer, on } from "@ngrx/store";
import { UserSiteSettingActions } from "./user-site-setting.actions";

export namespace UserSiteSettingStore {
    
    export const key = 'userSiteSetting';

    const getUserKey = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return `${user.username}_settings`;
        } catch (error) {
            return '';
        }
    }
    
    const getUserSiteSettingLocalStorage = (): State | null => {
        try {
            return JSON.parse(localStorage.getItem(getUserKey())) as State;
        } catch (error) {
            return null;
        }
    }
    
    const setUserSiteSettingLocalStorage = (value: State) => {
        localStorage.setItem(getUserKey(), JSON.stringify(value));
    }

    export interface State {
        notificationActive?: boolean;
        defaultDashboardProjectId?: number;
        confirmDeleteWidgetIdsDismissed?: number[];
    }
    
    export const initialState: State = {
        notificationActive: true,
    };
    
    const _reducer = createReducer(
        initialState,
        on(UserSiteSettingActions.load, () => {
            const localStorageValue = getUserSiteSettingLocalStorage();
            if (localStorageValue) {
                return localStorageValue;
            }
            return initialState;
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
            let newValue = {
                ...state,
                ...userSiteSetting
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
