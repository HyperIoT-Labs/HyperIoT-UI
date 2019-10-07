import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HDevice, HdevicesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { PageStatusEnum } from '../../model/pageStatusEnum';

@Component({
  selector: 'hyt-devices-form',
  templateUrl: './devices-form.component.html',
  styleUrls: ['./devices-form.component.scss']
})
export class DevicesFormComponent implements OnInit {

  submitType: string = 'ADD';

  deviceForm: FormGroup;

  @Output() saveDevice = new EventEmitter();

  @Output() updateDevice = new EventEmitter();

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  constructor(
    private fb: FormBuilder,
    private hDeviceService: HdevicesService,
  ) { }

  ngOnInit() {
    this.deviceForm = this.fb.group({});
  }

  postDevice() {
    this.errors = [];
    this.saveDevice.emit();
  }

  putDevice() {
    this.errors = [];
    this.updateDevice.emit();
  }

  invalid() {
    return (
      this.deviceForm.get('hdevice-devicename').invalid ||
      this.deviceForm.get('hdevice-brand').invalid ||
      this.deviceForm.get('hdevice-model').invalid ||
      this.deviceForm.get('hdevice-softwareversion').invalid ||
      this.deviceForm.get('hdevice-firmwareversion').invalid ||
      this.deviceForm.get('hdevice-description').invalid ||
      this.deviceForm.get('hdevice-password').invalid ||
      this.deviceForm.get('hdevice-passwordConfirm').invalid
    )
  }

  setForm(data: HDevice, type: string) {
    this.resetForm(type);
    this.deviceForm.get('hdevice-devicename').setValue((type == 'UPDATE') ? data.deviceName : data.deviceName + 'Copy');
    this.deviceForm.get('hdevice-brand').setValue(data.brand);
    this.deviceForm.get('hdevice-model').setValue(data.model);
    this.deviceForm.get('hdevice-firmwareversion').setValue(data.firmwareVersion);
    this.deviceForm.get('hdevice-softwareversion').setValue(data.softwareVersion);
    this.deviceForm.get('hdevice-description').setValue(data.description);
    this.deviceForm.get('hdevice-password').setValue(data.password);
    this.deviceForm.get('hdevice-passwordConfirm').setValue(data.passwordConfirm);
  }

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  resetForm(type: string) {
    this.submitType = type;
    if (this.submitType == 'UPDATE') {
      this.deviceForm.get('hdevice-password').disable();
      this.deviceForm.get('hdevice-passwordConfirm').disable();
    }
    else {
      this.deviceForm.get('hdevice-password').enable();
      this.deviceForm.get('hdevice-passwordConfirm').enable();
    }
    this.errors = [];
    this.deviceForm.reset();
  }

}
