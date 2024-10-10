import { Component, EventEmitter, OnInit } from '@angular/core';
import { DeviceActions } from '../../models/device-actions';

@Component({
  selector: 'hyt-map-device-info',
  templateUrl: './map-device-info.component.html',
  styleUrls: ['./map-device-info.component.scss']
})
export class MapDeviceInfoComponent implements OnInit {

  deviceInfo: any; //AreaDevice; //| Area;

  openClicked = new EventEmitter<any>();

  deviceActions = DeviceActions;

  constructor() { }

  ngOnInit(): void {
  }

  redirectTo(deviceAction?: DeviceActions) {
    this.openClicked.emit(deviceAction);
  }

}
