import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HDevice, HProject, HdevicesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';

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

  errors: HYTError[] = [];

  constructor(
    private fb: FormBuilder,
    private hDeviceService: HdevicesService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.deviceForm = this.fb.group({});
  }

  createDevice() {

    this.errors = [];

    let hDevice: HDevice = {
      entityVersion: 1,
      deviceName: this.deviceForm.value['hdevice-devicename'],
      brand: this.deviceForm.value.deviceBrand,
      model: this.deviceForm.value.deviceModel,
      softwareVersion: this.deviceForm.value.deviceSoftwareVersion,
      firmwareVersion: this.deviceForm.value.deviceFirmwareVersion,
      description: this.deviceForm.value.deviceDescription,
      password: this.deviceForm.value['hdevice-password'],
      passwordConfirm: this.deviceForm.value['hdevice-passwordConfirm'],
      project: { id: 579, entityVersion: 1 }
    }

    this.hDeviceService.saveHDevice(hDevice).subscribe(
      res => {
        this.devicesList.push(res);
        this.hDevicesOutput.emit(this.devicesList);
      },
      err => {
        this.errors = this.errorHandler.handleCreateHDevice(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.deviceForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )

  }

  invalid() {
    return (
      this.deviceForm.get('hdevice-devicename').invalid ||
      this.deviceForm.get('deviceBrand').invalid ||
      this.deviceForm.get('deviceModel').invalid ||
      this.deviceForm.get('deviceSoftwareVersion').invalid ||
      this.deviceForm.get('deviceFirmwareVersion').invalid ||
      this.deviceForm.get('deviceDescription').invalid ||
      this.deviceForm.get('hdevice-password').invalid ||
      this.deviceForm.get('hdevice-passwordConfirm').invalid
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  startAddDevice() {
    this.formDeviceActive = true;
  }

}