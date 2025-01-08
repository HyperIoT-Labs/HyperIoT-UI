import { Component, EventEmitter, OnInit } from '@angular/core';
import { DeviceActions } from '../../models/device-actions';
import { DeviceDataSource } from '../../models/device-data-source';

@Component({
  selector: 'hyt-map-device-info',
  templateUrl: './map-device-info.component.html',
  styleUrls: ['./map-device-info.component.scss']
})
export class MapDeviceInfoComponent implements OnInit {

  deviceInfo: any; //AreaDevice; //| Area;

  openClicked = new EventEmitter<any>();

  deviceActions = DeviceActions;
  deviceDataSource = DeviceDataSource;

  constructor() { }

  ngOnInit(): void {
  }

  redirectTo(deviceAction?: DeviceActions) {
    this.openClicked.emit(deviceAction);
  }

  redirectByDataSource(action: DeviceActions, dataSource: DeviceDataSource) {
    this.openClicked.emit({ action, dataSource });
  }

}
