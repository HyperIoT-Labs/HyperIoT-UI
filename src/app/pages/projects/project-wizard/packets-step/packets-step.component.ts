import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HDevice, HpacketsService, HPacket } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components/lib/hyt-select/hyt-select.component';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PageStatusEnum } from '../model/pageStatusEnum';

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
    { value: 'NONE', label: 'none', checked: true },
    { value: 'AVRO', label: 'avro' }
  ];

  trafficPlanOptions: SelectOption[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'INTENSIVE', label: 'Intensive' },
  ];

  packetForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

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

    this.pageStatus = PageStatusEnum.Loading;

    this.errors = [];

    let hPacket: HPacket = {
      entityVersion: 1,
      name: this.packetForm.value['packetName'],
      type: this.packetForm.value['hpacket-type'].value,
      format: this.packetForm.value['hpacket-format'].value,
      serialization: this.packetForm.value['hpacket-serialization'].value,
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
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
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
      this.packetForm.get('packetTrafficPlan').invalid
    )
  }

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

  deletePacket() {
    this.deleteError = null;
    this.hPacketService.deleteHPacket(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.packetsList.length; i++) {
          if (this.packetsList[i].id == this.deleteId) {
            this.packetsList.splice(i, 1);
          }
        }
        this.hPacketsOutput.emit(this.packetsList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
