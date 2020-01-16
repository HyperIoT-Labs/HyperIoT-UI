import { Component, OnInit } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { AreasService, HprojectsService, HdevicesService, AreaDevice, HDevice } from '@hyperiot/core';

@Component({
  selector: 'hyt-area-device-select-dialog',
  templateUrl: './area-device-select-dialog.component.html',
  styleUrls: ['./area-device-select-dialog.component.scss']
})
export class AreaDeviceSelectDialogComponent  extends HytModal implements OnInit {
  projectDevices: HDevice[];
  selectedDevice: HDevice;

  deviceIconOptions = [
    { label: 'Motion Sensor', value: 'motion-sensor.png' },
    { label: 'Wind Sensor', value: 'wind-sensor.png' },
    { label: 'Body Scanner', value: 'body-scanner.png' },
    { label: 'Door Sensor', value: 'door-sensor.png' },
    { label: 'GPS Sensor', value: 'gps-sensor.png' },
    { label: 'Automated Light', value: 'light.png' },
    { label: 'Rain Sensor', value: 'rain-sensor.png' },
    { label: 'RFID Sensor', value: 'rfid.png' },
    { label: 'Thermometer', value: 'thermometer.png' }
  ];
  selectedDeviceIcon: string;

  constructor(
    hytModalService: HytModalService,
    private areaService: AreasService,
    private deviceService: HdevicesService
  ) {
    super(hytModalService);
  }

  ngOnInit() {
    this.areaService.getAreaDeviceList(this.data.areaId).subscribe((areaDevices: AreaDevice[]) => {
      this.deviceService.findAllHDeviceByProjectId(this.data.projectId).subscribe((projectDevices: HDevice[]) => {
        this.projectDevices = projectDevices;
        projectDevices.map(pd => {
          const ad = areaDevices.filter((d) => d.device.id === pd.id);
          if (ad.length === 1) {
            pd['added'] = true;
          }
        });
      });
    });
  }

  onAddButtonClick() {
    this.close({ device: this.selectedDevice, icon: this.selectedDeviceIcon });
  }
}
