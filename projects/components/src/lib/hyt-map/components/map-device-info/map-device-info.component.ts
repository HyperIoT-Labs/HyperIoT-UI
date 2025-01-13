import { Component, EventEmitter } from '@angular/core';
import { Area, AreaDevice, Dashboard } from 'core';
import { MapItemAction } from '../../models/map-item-action';
import { DeviceActions } from '../../models/device-actions';

@Component({
  selector: 'hyt-map-device-info',
  templateUrl: './map-device-info.component.html',
  styleUrls: ['./map-device-info.component.scss']
})
export class MapDeviceInfoComponent {

  deviceInfo: Area | AreaDevice;

  readonly deviceActions = DeviceActions;
  readonly dataSource = Dashboard.DashboardTypeEnum;

  readonly openClicked = new EventEmitter<MapItemAction>();

  redirectByMapItemAction(mapItemAction: MapItemAction) {
    this.openClicked.emit(mapItemAction);
  }

  isArea(obj: Area | AreaDevice): obj is Area {
    return (obj as Area).name !== undefined;
  }

  isAreaDevice(obj: Area | AreaDevice): obj is AreaDevice {
    const {area, device} = obj as AreaDevice;
    return [area, device].some((attr) => attr !== undefined);
  }

}
