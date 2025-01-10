import { Component, EventEmitter } from '@angular/core';
import { Area, AreaDevice, Dashboard } from 'core';
import { MapItem } from '../../models/map-item';
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

  readonly openClicked = new EventEmitter<MapItem>();

  redirectByMapItem(mapItem: MapItem) {
    this.openClicked.emit(mapItem);
  }

  isArea(obj: Area | AreaDevice): obj is Area {
    return (obj as Area).name !== undefined;
  }

  isAreaDevice(obj: Area | AreaDevice): obj is AreaDevice {
    const {area, device} = obj as AreaDevice;
    return [area, device].some((attr) => attr !== undefined);
  }

}
