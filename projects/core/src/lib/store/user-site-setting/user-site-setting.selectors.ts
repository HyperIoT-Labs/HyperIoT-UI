import { createSelector } from "@ngrx/store";
import { HyperiotStore, UserSiteSettingStore } from "..";

const selectUserSiteSetting = (state: HyperiotStore.State) => state.userSiteSetting;

const selectNotificationActive = createSelector(
  selectUserSiteSetting,
  (state: UserSiteSettingStore.State) => state.notificationActive
);

const selectDefaultProjectsDashboardDataSource = createSelector(
  selectUserSiteSetting,
  (state: UserSiteSettingStore.State) => state.defaultProjectsDashboardDataSource
);

const selectDefaultAreasDashboardDataSource = createSelector(
  selectUserSiteSetting,
  (state: UserSiteSettingStore.State) => state.defaultAreasDashboardDataSource
);

const selectLastHdDashboardDataSource = createSelector(
  selectUserSiteSetting,
  (state: UserSiteSettingStore.State) => state.lastHdDashboardDataSource
);

export const UserSiteSettingSelectors = {
  selectUserSiteSetting,
  selectNotificationActive,
  selectDefaultProjectsDashboardDataSource,
  selectDefaultAreasDashboardDataSource,
  selectLastHdDashboardDataSource
}
