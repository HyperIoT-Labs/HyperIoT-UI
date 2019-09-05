import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HDevice, HpacketsService, HPacket } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components/lib/hyt-select/hyt-select.component';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';

export enum myEnum {
  Customer = 1,
  Store = 2
}

@Component({
  selector: 'hyt-packets-step',
  templateUrl: './packets-step.component.html',
  styleUrls: ['./packets-step.component.scss']
})
export class PacketsStepComponent implements OnInit, OnChanges {

  @Input() hDevices: HDevice[] = [];

  devicesOptions: SelectOption[] = [];

  errors: HYTError[] = [];

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
    { value: 'AVRO', label: 'avro', checked: true },
    { value: 'NONE', label: 'none' }
  ];

  trafficPlanOptions: SelectOption[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'INTENSIVE', label: 'Intensive' },
  ];

  packetForm: FormGroup;

  packetsList: HPacket[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.packetForm = this.fb.group({});
  }

  ngOnChanges() {
    this.devicesOptions = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })
  }

  createPacket() {

    this.errors = [];

    let hPacket: HPacket = {
      entityVersion: 1,
      name: this.packetForm.value['packetName'],
      type: this.packetForm.value.packetTypology.value,
      format: this.packetForm.value.packetFormat.value,
      serialization: this.packetForm.value.packetSerialization.value,
      fields: [],
      trafficPlan: 'HIGH',
      timestampField: 'timestampField',
      timestampFormat: 'dd/MM/yyyy HH.mmZ',
      version: '1',
      device: { entityVersion: 1, id: this.packetForm.value.packetDevice }
    }

    this.hPacketService.saveHPacket(hPacket).subscribe(
      res => {
        this.packetsList.push(res);
        this.hPacketsOutput.emit(this.packetsList);
      },
      err => {
        this.errors = this.errorHandler.handleCreatePacket(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.packetForm.get(e.container).setErrors({
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
      this.packetForm.get('packetName').invalid ||
      this.packetForm.get('packetDevice').invalid ||
      this.packetForm.get('packetTypology').invalid ||
      this.packetForm.get('packetFormat').invalid ||
      this.packetForm.get('packetSerialization').invalid ||
      this.packetForm.get('packetTrafficPlan').invalid
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

}
