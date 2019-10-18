import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { HdevicesService, HDevice } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { DevicesFormComponent } from './devices-form/devices-form.component';
import { PageStatusEnum } from '../model/pageStatusEnum';

@Component({
  selector: 'hyt-devices-step',
  templateUrl: './devices-step.component.html',
  styleUrls: ['./devices-step.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DevicesStepComponent {

  selectedDevice: HDevice;

  @ViewChild('devicesForm', { static: false }) form: DevicesFormComponent;

  constructor(
    private hDeviceService: HdevicesService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  saveDevice() {

    this.form.pageStatus = PageStatusEnum.Loading;

    let hDevice: HDevice = {
      entityVersion: 1,
      deviceName: this.form.deviceForm.value['hdevice-devicename'],
      brand: this.form.deviceForm.value['hdevice-brand'],
      model: this.form.deviceForm.value['hdevice-model'],
      softwareVersion: this.form.deviceForm.value['hdevice-softwareversion'],
      firmwareVersion: this.form.deviceForm.value['hdevice-firmwareversion'],
      description: this.form.deviceForm.value['hdevice-description'],
      password: this.form.deviceForm.value['hdevice-password'],
      passwordConfirm: this.form.deviceForm.value['hdevice-passwordConfirm'],
      project: { id: this.wizardService.getHProject().id, entityVersion: this.wizardService.getHProject().entityVersion }
    }

    this.hDeviceService.saveHDevice(hDevice).subscribe(
      (res: HDevice) => {
        this.form.resetForm('ADD');
        this.form.pageStatus = PageStatusEnum.Submitted;
        this.wizardService.addDevice(res);
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreateHDevice(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.deviceForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )
  }

  updateDevice() {

    this.form.pageStatus = PageStatusEnum.Loading;

    this.selectedDevice.deviceName = this.form.deviceForm.value['hdevice-devicename'];
    this.selectedDevice.brand = this.form.deviceForm.value['hdevice-brand'];
    this.selectedDevice.model = this.form.deviceForm.value['hdevice-model'];
    this.selectedDevice.softwareVersion = this.form.deviceForm.value['hdevice-softwareversion'];
    this.selectedDevice.firmwareVersion = this.form.deviceForm.value['hdevice-firmwareversion'];
    this.selectedDevice.description = this.form.deviceForm.value['hdevice-description'];

    this.hDeviceService.updateHDevice(this.selectedDevice).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.form.pageStatus = PageStatusEnum.Submitted;
        this.wizardService.updateDevice(res);
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreateHDevice(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.deviceForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )
  }

  tableUpdateDevice(device: HDevice) {
    this.selectedDevice = device;
    this.form.setForm(device, 'UPDATE');
  }

  tableCopyDevice(device: HDevice) {
    this.form.setForm(device, 'ADD');
  }

  //delete logic

  deleteModal: boolean = false;

  deleteError: string = null;

  showDeleteModal(device: HDevice) {
    this.deleteError = null;
    this.selectedDevice = device;
    this.deleteModal = true;
  }

  hideDeleteModal() {
    this.deleteModal = false;
    this.selectedDevice = null;
  }

  deleteDevice() {
    this.deleteError = null;
    this.hDeviceService.deleteHDevice(this.selectedDevice.id).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.wizardService.deleteDevice(this.selectedDevice.id);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}