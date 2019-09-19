import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { HDevice, HProject, HdevicesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PageStatusEnum } from '../model/pageStatusEnum';

@Component({
  selector: 'hyt-devices-step',
  templateUrl: './devices-step.component.html',
  styleUrls: ['./devices-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DevicesStepComponent implements OnInit {

  @Input() hProject: HProject;

  deviceForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  devicesList: HDevice[] = [];

  @Output() hDevicesOutput = new EventEmitter<HDevice[]>();

  constructor(
    private fb: FormBuilder,
    private hDeviceService: HdevicesService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.deviceForm = this.fb.group({});
  }

  createDevice() {

    this.pageStatus = PageStatusEnum.Loading;

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
      project: { id: this.hProject.id, entityVersion: 1 }
    }

    this.hDeviceService.saveHDevice(hDevice).subscribe(
      res => {
        this.devicesList.push(res);
        this.hDevicesOutput.emit(this.devicesList);
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
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

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  //delete logic

  deleteId: number = -1;

  deleteError: string = null;

  showDeleteModal(id: number) {
    this.deleteError = null;
    this.deleteId = id;
  }

  hideDeleteModal() {
    this.deleteId = -1;
  }

  deleteDevice() {
    this.deleteError = null;
    this.hDeviceService.deleteHDevice(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.devicesList.length; i++) {
          if (this.devicesList[i].id == this.deleteId) {
            this.devicesList.splice(i, 1);
          }
        }
        this.hDevicesOutput.emit(this.devicesList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}