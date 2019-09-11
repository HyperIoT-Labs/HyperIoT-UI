import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HPacketField, HpacketsService, HPacket, HDevice } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { Node } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { Settings } from 'http2';

interface PacketNode extends Node {
  id: number;
}

interface PacketTreeView {
  packetName: string;
  tree: PacketNode[];
}

@Component({
  selector: 'hyt-fields-step',
  templateUrl: './fields-step.component.html',
  styleUrls: ['./fields-step.component.scss']
})
export class FieldsStepComponent implements OnInit, OnChanges {

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  packetTreeView: PacketTreeView[] = [];

  fieldForm: FormGroup;

  multiplicityOptions: Option[] = [
    { value: 'SINGLE', label: 'Single', checked: true },
    { value: 'ARRAY', label: 'Array' },
    { value: 'MATRIX', label: 'Matrix' }
  ];

  typeOptions: SelectOption[] = [
    { value: 'OBJECT', label: 'OBJECT' },
    { value: 'INTEGER', label: 'INTEGER' },
    { value: 'DOUBLE', label: 'DOUBLE' },
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'BOOLEAN', label: 'BOOLEAN' },
    { value: 'DATE', label: 'DATE' },
    { value: 'TEXT', label: 'TEXT' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' },
    { value: 'CATEGORY', label: 'CATEGORY' },
    { value: 'TAG', label: 'TAG' }
  ];

  errors: HYTError[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() { }

  devicesOptions: SelectOption[] = [];

  currentDevice: HDevice;

  ngOnChanges() {
    this.devicesOptions = [];
    this.packetTreeView = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })
    this.updatePacketTreeView();
  }

  updatePacketTreeView() {
    this.packetTreeView = [];
    if (this.currentDevice) {
      let packetsForDevice = this.hPackets.filter(x => x.device.id == this.currentDevice.id)
      packetsForDevice.forEach(x => {
        this.packetTreeView.push({
          packetName: x.name,
          tree: this.createTree(x.fields)
        })
      })
    }
  }

  createTree(fields: HPacketField[]): PacketNode[] {
    let node: PacketNode[] = [];
    fields.forEach(element => {
      node.push({
        id: element.id,
        name: element.name,
        lom: element.multiplicity,
        type: element.type,
        children: (element.innerFields) ? this.createTree(element.innerFields) : null
      })
    });
    return node;
  }

  deviceChanged(event) {
    this.currentDevice = this.hDevices.find(x => x.id == event.value)
    this.updatePacketTreeView();
  }

  idPacket: string;

  createField() {

    this.errors = [];

    let hPacketField: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value['fieldName'],
      multiplicity: this.fieldForm.value.fieldMultiplicity.value,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription,
      innerFields: (this.fieldForm.value.fieldMultiplicity.value == 'SINGLE') ? null : []
    }

    let id = this.hPackets.find(x => x.name == this.idPacket).id;

    this.hPacketService.addHPacketField(id, hPacketField).subscribe(//    this.hPacketService.addHPacketField(this.idPacket, hPacketField).subscribe(
      res => {
        this.hPackets.find(x => x.id == id).fields.push(res);//  this.hPackets.find(x => x.id == this.idPacket).fields.push(res);
        this.hPacketsOutput.emit(this.hPackets);
        this.fieldForm = null;
      },
      err => {
        this.errors = this.errorHandler.handleCreateField(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.fieldForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    );

  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  invalid() {
    return (
      this.fieldForm.get('fieldName').invalid ||
      this.fieldForm.get('fieldType').invalid
    )
  }

  addField(event) {
    console.log(event)
    this.idPacket = event.name;//ID instead of NAME
    this.fieldForm = this.fb.group({});
  }

  removeField(event) {
    console.log("remove")
  }

}
