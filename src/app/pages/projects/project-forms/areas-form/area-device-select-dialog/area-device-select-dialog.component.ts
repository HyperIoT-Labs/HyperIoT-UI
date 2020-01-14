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

  constructor(
    hytModalService: HytModalService,
    private areaService: AreasService,
    private projectService: HprojectsService,
    private deviceService: HdevicesService
  ) {
    super(hytModalService);
  }

  ngOnInit() {
    console.log(this.data);
    this.areaService.getAreaDeviceList(this.data.areaId).subscribe((res: AreaDevice[]) => {
      console.log(res);
    });
    this.deviceService.findAllHDeviceByProjectId(this.data.projectId).subscribe((res) => {
      console.log('devices', res);
      this.projectDevices = res;
    });
  }

}
