
import { Area, AreaDevice, Dashboard, HDevice } from "core";
import { DeviceActions } from "./device-actions";

export interface MapItem<T = Area | AreaDevice> {
    item: T,
    action: DeviceActions;
    dataSource?: Dashboard.DashboardTypeEnum
}