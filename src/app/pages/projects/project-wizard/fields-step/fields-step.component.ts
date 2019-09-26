import { Component, OnInit, Input, EventEmitter, Output, OnChanges, ViewChild } from '@angular/core';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HPacketField, HpacketsService, HPacket, HDevice } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { Node } from '@hyperiot/components';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { HytTreeViewEditableComponent } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';

enum FormStatusEnum {
  SelectAction = 0,
  Editable = 1,
  Loading = 2,
  Error = -1
}

@Component({
  selector: 'hyt-fields-step',
  templateUrl: './fields-step.component.html',
  styleUrls: ['./fields-step.component.scss']
})
export class FieldsStepComponent implements OnInit, OnChanges {

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  @ViewChild('treeView', { static: false }) treeView: HytTreeViewEditableComponent;

  packetTree: Node[];

  currentPacket: HPacket;

  currentDevice: HDevice;

  currentField;

  selectForm: FormGroup;
  fieldForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  formStatus: FormStatusEnum = FormStatusEnum.SelectAction;

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

  ngOnInit() {
    this.fieldForm = this.fb.group({});
    this.selectForm = this.fb.group({});
  }

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  internal: boolean = false;

  ngOnChanges() {
    if (!this.internal) {
      this.resetForm();
      this.currentPacket = null;
      this.selectForm.reset();
      this.devicesOptions = [];
      this.packetsOptions = [];
      for (let el of this.hDevices)
        this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })
    }
    this.internal = false;
    if (this.currentPacket) {
      this.packetTree = [...this.createPacketTree(this.currentPacket.fields)];
      if (this.treeView)
        this.treeView.refresh(this.packetTree, this.currentDevice.deviceName);
    }
  }

  createPacketTree(fields: HPacketField[]): Node[] {
    let node: Node[] = [];
    fields.forEach(element => {
      node.push({
        data: element,
        root: false,
        name: element.name,
        lom: element.multiplicity,
        type: element.type,
        children: (element.innerFields) ? this.createPacketTree(element.innerFields) : null
      })
    });
    return node;
  }

  updatePacketView(fields: HPacketField[], id: number, hPacketField: HPacketField) {
    fields.forEach(x => {
      if (x.innerFields != null) {
        if (x.id == id) {
          x.innerFields.push(hPacketField);
          return;
        }
        else {
          return this.updatePacketView(x.innerFields, id, hPacketField);
        }
      }
    })
  }

  updatePacketViewDelete(fields: HPacketField[], id: number) {
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].id == id) {
        fields.splice(i, 1);
        return;
      }
      else if (fields[i].innerFields != null)
        this.updatePacketViewDelete(fields[i].innerFields, id);
    }
  }

  deviceChanged(event) {
    console.log("device")
    this.packetsOptions = [];
    this.currentDevice = this.hDevices.find(x => x.id == event.value);
    this.hPackets.filter(p => p.device.id == this.currentDevice.id).forEach(p => this.packetsOptions.push({ value: p.id.toString(), label: p.name }));
  }

  packetChanged(event) {
    console.log("packet")
    this.currentPacket = this.hPackets.find(x => x.id == event.value);
    this.packetTree = [...this.createPacketTree(this.currentPacket.fields)];
    if (this.treeView)
      this.treeView.refresh(this.packetTree, this.currentDevice.deviceName);
  }

  createField() {

    this.pageStatus = PageStatusEnum.Loading;
    this.formStatus = FormStatusEnum.Loading;

    this.errors = [];

    let field: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value['fieldName'],
      multiplicity: this.fieldForm.value.fieldMultiplicity.value,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription,
      innerFields: (this.fieldForm.value.fieldType == 'OBJECT') ? [] : null,
      parentField: (this.currentField) ? { id: this.currentField.id, entityVersion: this.currentField.entityVersion } : null
    }

    this.hPacketService.addHPacketField(this.currentPacket.id, field).subscribe(
      res => {
        if (!field.parentField)
          this.hPackets.find(x => x.id == this.currentPacket.id).fields.push(res);
        else
          this.updatePacketView(this.hPackets.find(x => x.id == this.currentPacket.id).fields, field.parentField.id, res);
        this.internal = true;
        this.hPacketsOutput.emit(this.hPackets);
        this.resetForm();
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
        this.formStatus = FormStatusEnum.Editable;
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
      !this.fieldForm.value.fieldMultiplicity ||
      this.fieldForm.get('fieldType').invalid
    )
  }

  addField(event) {
    this.currentField = event.data;
    this.formStatus = FormStatusEnum.Editable;
  }

  deletePacket: HPacket;
  deleteFieldId: number;
  deleteModal: boolean = false;

  removeField(event, packet: HPacket) {
    this.deletePacket = packet;
    this.deleteFieldId = event.data.id;
    if (event.children && event.children.length != 0) {
      this.deleteModal = true;
    }
    else
      this.deleteField();

  }

  deleteField() {
    this.formStatus = FormStatusEnum.SelectAction;
    this.hPacketService.deleteHPacketField(this.deletePacket.id, this.deleteFieldId).subscribe(
      res => {
        this.updatePacketViewDelete(this.deletePacket.fields, this.deleteFieldId);
        this.hPacketsOutput.emit(this.hPackets);
      },
      err => { }
    )
  }

  confDelete(cd: boolean): void {
    if (cd)
      this.deleteField();
    this.deleteModal = false;
  }

  cancelField() {
    this.formStatus = FormStatusEnum.SelectAction;
    this.resetForm();
  }

  resetForm() {
    this.formStatus = FormStatusEnum.SelectAction;
    this.fieldForm.reset();
    this.currentField = null;
  }

}
