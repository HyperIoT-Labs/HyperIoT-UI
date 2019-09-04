import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HDevice, HProject, HdevicesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-devices-step',
  templateUrl: './devices-step.component.html',
  styleUrls: ['./devices-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DevicesStepComponent implements OnInit {

  @Input() hProject: HProject;

  deviceForm: FormGroup;

  devicesList: HDevice[] = [];

  @Output() hDevicesOutput = new EventEmitter<HDevice[]>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hDeviceService: HdevicesService
  ) { }

  ngOnInit() {
    this.deviceForm = this.fb.group({});
  }

  createDevice() {

    let hDevice: HDevice = {
      entityVersion: 1,
      deviceName: this.deviceForm.value.deviceName,
      brand: this.deviceForm.value.deviceBrand,
      model: this.deviceForm.value.deviceModel,
      softwareVersion: this.deviceForm.value.deviceSoftwareVersion,
      firmwareVersion: this.deviceForm.value.deviceFirmwareVersion,
      description: this.deviceForm.value.deviceDescription,
      password: this.deviceForm.value.devicePassword,
      passwordConfirm: this.deviceForm.value.devicePasswordConfirm,
      project: { id: this.hProject.id, entityVersion: 1 }
    }

    this.hDeviceService.saveHDevice(hDevice).subscribe(
      res => {
        this.devicesList.push(res);
        this.hDevicesOutput.emit(this.devicesList);
      },
      err => console.log(err)
    )
  }

  invalid() {
    return (
      this.deviceForm.get('deviceName').invalid ||
      this.deviceForm.get('deviceBrand').invalid ||
      this.deviceForm.get('deviceModel').invalid ||
      this.deviceForm.get('deviceSoftwareVersion').invalid ||
      this.deviceForm.get('deviceFirmwareVersion').invalid ||
      this.deviceForm.get('deviceDescription').invalid ||
      this.deviceForm.get('devicePassword').invalid ||
      this.deviceForm.get('devicePasswordConfirm').invalid
    )
  }

  startAddDevice() {
    this.formDeviceActive = true;
  }

}