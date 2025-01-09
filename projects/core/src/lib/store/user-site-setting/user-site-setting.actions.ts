import { createAction, props } from "@ngrx/store";
import { UserSiteSettingStore } from "./user-site-setting.reducer";

export namespace UserSiteSettingActions {

    export const load = createAction('[UserSiteSetting] Load');
    export const clear = createAction(
        '[UserSiteSetting] Clear'
    );
    export const setAllSettings = createAction(
        '[UserSiteSetting] Update All Settings',
        props<{ userSiteSetting: UserSiteSettingStore.State }>()
    );
    export const updatePartialSettings = createAction(
        '[UserSiteSetting] Update All Settings',
        props<{ userSiteSetting: UserSiteSettingStore.State }>()
    );
    export const updateSetting = createAction(
        '[UserSiteSetting] Update Setting',
        props<{ key: keyof UserSiteSettingStore.State, value: any }>()
    );
    export const toggleNotification = createAction(
        '[UserSiteSetting] Toggle Notification Status'
    );
}
