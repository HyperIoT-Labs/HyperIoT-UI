import { Component, EventEmitter } from '@angular/core';
import { Area, AreaDevice, Dashboard } from 'core';
import { MapItemAction } from '../../models/map-item-action';
import { DeviceActions } from '../../models/device-actions';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'hyt-map-device-info',
  templateUrl: './map-device-info.component.html',
  styleUrls: ['./map-device-info.component.scss']
})
export class MapDeviceInfoComponent {

  constructor(public utilsService: UtilsService) { }

  itemData: Area | AreaDevice;

  readonly deviceActions = DeviceActions;
  readonly dataSource = Dashboard.DashboardTypeEnum;

  readonly openClicked = new EventEmitter<MapItemAction>();

  redirectByMapItemAction(mapItemAction: MapItemAction) {
    this.openClicked.emit(mapItemAction);
  }

}
