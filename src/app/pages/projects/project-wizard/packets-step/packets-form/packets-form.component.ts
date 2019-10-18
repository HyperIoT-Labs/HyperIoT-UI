import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { SelectOption, Option } from '@hyperiot/components';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { HDevice, HPacket } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { PageStatusEnum } from '../../model/pageStatusEnum';

@Component({
  selector: 'hyt-packets-form',
  templateUrl: './packets-form.component.html',
  styleUrls: ['./packets-form.component.scss']
})
export class PacketsFormComponent implements OnInit {

  submitType: string = 'ADD';

  packetForm: FormGroup;

  @Output() savePacket = new EventEmitter();

  @Output() updatePacket = new EventEmitter();

  devicesOptions: SelectOption[] = [];

  currentDeviceValue: HDevice;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  typologyOptions: Option[] = [
    { value: 'INPUT', label: 'Input', checked: true },
    { value: 'OUTPUT', label: 'Output' },
    { value: 'IO', label: 'I/O' }
  ];

  formatOptions: Option[] = [
    { value: 'JSON', label: 'json', checked: true },
    { value: 'XML', label: 'xml' },
    { value: 'CSV', label: 'csv' }
  ];

  serializationOptions: Option[] = [
    { value: 'NONE', label: 'none', checked: true },
    { value: 'AVRO', label: 'avro' }
  ];

  trafficPlanOptions: SelectOption[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'INTENSIVE', label: 'Intensive' },
  ];

  constructor(
    private fb: FormBuilder,
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.packetForm = this.fb.group({});
    this.wizardService.hDevices$.subscribe(
      (res: HDevice[]) => {
        this.devicesOptions = [];
        for (let el of res)
          this.devicesOptions.push({ value: el, label: el.deviceName });
        this.packetForm.get('hpacket-device').setValue((this.devicesOptions.length != 0) ? this.devicesOptions[0].value : null);
      }
    )
  }

  postPacket() {
    this.errors = [];
    this.savePacket.emit();
  }

  putPacket() {
    this.errors = [];
    this.updatePacket.emit();
  }

  invalid() {
    return (
      this.packetForm.get('hpacket-name').invalid ||
      this.packetForm.get('hpacket-device').invalid ||
      this.packetForm.get('hpacket-type').invalid ||
      this.packetForm.get('hpacket-format').invalid ||
      this.packetForm.get('hpacket-serialization').invalid ||
      this.packetForm.get('packetTrafficPlan').invalid ||
      this.packetForm.get('hpacketTimeStamp').invalid ||
      this.packetForm.get('hpacketTimeStampFormat').invalid
    )
  }

  setForm(data: HPacket, type: string) {
    this.resetForm(type);
    this.packetForm.get('hpacket-name').setValue((type == 'UPDATE') ? data.name : data.name + 'Copy');
    this.packetForm.get('hpacket-device').setValue(this.devicesOptions.find(d => d.value.id == data.device.id).value);
    this.packetForm.get('hpacket-type').setValue(data.type);
    this.packetForm.get('hpacket-format').setValue(data.format);
    this.packetForm.get('hpacket-serialization').setValue(data.serialization);
    this.packetForm.get('packetTrafficPlan').setValue(data.trafficPlan);
    this.packetForm.get('hpacketTimeStamp').setValue(data.timestampField);
    this.packetForm.get('hpacketTimeStampFormat').setValue(data.timestampFormat);
  }

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  resetForm(type: string) {
    this.submitType = type;
    this.errors = [];
    this.packetForm.reset();
    this.packetForm.get('hpacketTimeStamp').setValue('timestamp');
    this.packetForm.get('hpacketTimeStampFormat').setValue('dd/MM/yyyy HH.mmZ');
    this.packetForm.get('hpacket-type').setValue('INPUT');
    this.packetForm.get('hpacket-format').setValue('JSON');
    this.packetForm.get('hpacket-serialization').setValue('NONE');
    this.packetForm.get('hpacket-device').setValue((this.devicesOptions.length != 0) ? this.devicesOptions[0].value : null);
    this.packetForm.get('packetTrafficPlan').setValue('MEDIUM');
  }

  updateHint(event: string) {
    this.wizardService.updateHint(event, 2);
  }

}
