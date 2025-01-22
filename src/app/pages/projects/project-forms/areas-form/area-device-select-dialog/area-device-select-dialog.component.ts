import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { DIALOG_DATA, DialogRef } from 'components';
import { Area_Service, HDevicesService, AreaDevice, HDevice, Area } from 'core';
import { LoadingStatusEnum } from '../../project-form-entity';
import { AREA_ICONS_OPTIONS } from 'projects/components/src/public-api';

@Component({
  selector: 'hyt-area-device-select-dialog',
  templateUrl: './area-device-select-dialog.component.html',
  styleUrls: ['./area-device-select-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreaDeviceSelectDialogComponent implements OnInit {
  projectDevices = [] as HDevice[];
  selectedDevice: HDevice;
  loadingStatus = LoadingStatusEnum.Ready;
  LoadingStatus = LoadingStatusEnum;

   // @@I18N@@ (for all labels)
  deviceIconOptions = [];
  selectedDeviceIcon: string;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
    private areaService: Area_Service,
    private deviceService: HDevicesService
  ) { }

  ngOnInit() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.deviceIconOptions = AREA_ICONS_OPTIONS.get(this.data.areaType);
    this.deviceService.findAllHDeviceByProjectId(this.data.projectId).subscribe((projectDevices: HDevice[]) => {
      this.projectDevices = projectDevices;
      this.areaService.getAreaDeviceDeepListFromRoot(this.data.areaId).subscribe((assignedDevices) => {
        this.loadingStatus = LoadingStatusEnum.Ready;
        projectDevices.map(pd => {
          const ad = assignedDevices.filter((d: AreaDevice) => d.device.id === pd.id);
          if (ad.length > 0) {
            pd['added'] = true;
            this.areaService.findArea(ad[0].area.id)
              .subscribe((deviceArea: Area) => {
                pd['area'] = deviceArea.name;
              });
          }
        });
      }, (err) => this.apiError(err));
    }, (err) => this.apiError(err));
  }

  close(deviceData?) {
    this.dialogRef.close(deviceData);
  }

  private apiError(err) {
    this.loadingStatus = LoadingStatusEnum.Error;
  }
}
