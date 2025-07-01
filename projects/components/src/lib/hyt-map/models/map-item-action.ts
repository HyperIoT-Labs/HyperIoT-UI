

import { Area, AreaDevice, Dashboard, HDevice, } from "core";
import { DeviceActions } from "./device-actions";

export type AreaItem = Area | AreaDevice | HDevice; 

export interface MapItemAction {
    item: AreaItem;
    action: DeviceActions;
    dataSource?: Dashboard.DashboardTypeEnum;
}