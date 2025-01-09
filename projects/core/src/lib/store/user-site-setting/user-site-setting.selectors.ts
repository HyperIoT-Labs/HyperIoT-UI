import { createSelector } from "@ngrx/store";
import { HyperiotStore, UserSiteSettingStore } from "..";

const selectUserSiteSetting = (state: HyperiotStore.State) => state.userSiteSetting;
 
const selectNotificationActive = createSelector(
    selectUserSiteSetting,
    (state: UserSiteSettingStore.State) => state.notificationActive
);

export const UserSiteSettingSelectors = {
    selectUserSiteSetting,
    selectNotificationActive,
}