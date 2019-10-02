import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';
import { HytTreeViewEditableComponent, Node } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PageStatusEnum } from '../../model/pageStatusEnum';
import { Option, SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';

enum FormStatusEnum {
  SelectAction = 0,
  Editable = 1,
  Loading = 2,
  Error = -1
}

@Component({
  selector: 'hyt-packet-field',
  templateUrl: './packet-field.component.html',
  styleUrls: ['./packet-field.component.scss']
})
export class PacketFieldComponent implements OnInit, OnChanges {

  @Input() currentPacket: HPacket;

  @Input() hPackets: HPacket[] = [];

  @ViewChild('treeView', { static: false }) treeView: HytTreeViewEditableComponent;

  packetTree: Node[];

  currentField;

  fieldForm: FormGroup;

  submitType: string = 'ADD';

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
  }

  ngOnChanges() {
    if (this.currentPacket) {
      this.packetTree = [...this.createPacketTree(this.currentPacket.fields)];
      console.log(this.packetTree)
      if (this.treeView)
        this.treeView.refresh(this.packetTree, this.currentPacket.name);
    }
  }

  createPacketTree(fields: HPacketField[]): Node[] {
    let node: Node[] = [];
    if (fields)
      fields.forEach(element => {
        node.push({
          data: element,
          root: false,
          name: element.name,
          lom: element.multiplicity,
          type: element.type,
          children: (element.type == 'OBJECT') ? this.createPacketTree(element.innerFields) : null
        })
      });
    return node;
  }

  // updatePacketView(fields: HPacketField[], id: number, hPacketField: HPacketField) {
  //   fields.forEach(x => {
  //     if (x.innerFields != null) {
  //       if (x.id == id) {
  //         x.innerFields.push(hPacketField);
  //         return;
  //       }
  //       else {
  //         return this.updatePacketView(x.innerFields, id, hPacketField);
  //       }
  //     }
  //   })
  // }

  // updatePacketViewDelete(fields: HPacketField[], id: number) {
  //   for (var i = 0; i < fields.length; i++) {
  //     if (fields[i].id == id) {
  //       fields.splice(i, 1);
  //       return;
  //     }
  //     else if (fields[i].innerFields != null)
  //       this.updatePacketViewDelete(fields[i].innerFields, id);
  //   }
  // }

  // updatePacketViewUpdate(fields: HPacketField[], hPacketField: HPacketField) {
  //   for (let i = 0; i < fields.length; i++) {
  //     if (fields[i].id == hPacketField.id) {
  //       fields[i].name = hPacketField.name;
  //       fields[i].multiplicity = hPacketField.multiplicity;
  //       fields[i].type = hPacketField.type;
  //       fields[i].description = hPacketField.description;
  //       console.log(fields[i]);
  //     }
  //     else if (fields[i].innerFields)
  //       this.updatePacketViewUpdate(fields[i].innerFields, hPacketField)
  //   }
  // }

  createField() {

    this.pageStatus = PageStatusEnum.Loading;
    this.formStatus = FormStatusEnum.Loading;

    this.errors = [];

    let field: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value['fieldName'],
      multiplicity: this.fieldForm.value.fieldMultiplicity,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription,
      innerFields: [], //(this.fieldForm.value.fieldType == 'OBJECT') ? [] : null,
      parentField: (this.currentField) ? { id: this.currentField.id, entityVersion: this.currentField.entityVersion } : null
    }

    this.hPacketService.addHPacketField(this.currentPacket.id, field).subscribe(
      res => {
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(
          res => {
            this.currentPacket = res;
            for (let k = 0; k < this.hPackets.length; k++)
              if (this.hPackets[k].id == this.currentPacket.id)
                this.hPackets[k] = this.currentPacket;
            this.ngOnChanges();
            this.hPacketsOutput.emit(this.hPackets);
            this.resetForm('ADD');
            this.pageStatus = PageStatusEnum.Submitted;
          }
        )
        // if (!field.parentField)
        //   this.currentPacket.fields.push(res);
        // else
        //   this.updatePacketView(this.currentPacket.fields, field.parentField.id, res);
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

  updateField() {

    this.pageStatus = PageStatusEnum.Loading;
    this.formStatus = FormStatusEnum.Loading;

    this.errors = [];

    let field: HPacketField = {
      id: this.currentField.id,
      entityVersion: this.currentField.entityVersion,
      name: this.fieldForm.value['fieldName'],
      multiplicity: this.fieldForm.value.fieldMultiplicity,
      type: this.fieldForm.value.fieldType || this.currentField.type,
      description: this.fieldForm.value.fieldDescription
    }

    console.log(field);

    this.hPacketService.updateHPacketField(this.currentPacket.id, field).subscribe(
      res => {
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(
          res => {
            this.currentPacket = res;
            for (let k = 0; k < this.hPackets.length; k++)
              if (this.hPackets[k].id == this.currentPacket.id)
                this.hPackets[k] = this.currentPacket;
            this.ngOnChanges();
            this.hPacketsOutput.emit(this.hPackets);
            this.resetForm('ADD');
            this.pageStatus = PageStatusEnum.Submitted;
          }
        )
        // this.updatePacketViewUpdate(this.currentPacket.fields, field);
        // console.log("ok")
        // this.ngOnChanges();
        // this.resetForm('ADD');
        // this.hPacketsOutput.emit(this.hPackets);
        // this.pageStatus = PageStatusEnum.Submitted;
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
    this.resetForm('ADD');
    this.currentField = event.data;
    this.formStatus = FormStatusEnum.Editable;
  }

  deleteFieldId: number;
  deleteModal: boolean = false;

  removeField(event) {
    this.resetForm('ADD');
    this.deleteFieldId = event.data.id;
    if (event.children && event.children.length != 0) {
      this.deleteModal = true;
    }
    else
      this.deleteField();

  }

  deleteField() {
    this.hPacketService.deleteHPacketField(this.currentPacket.id, this.deleteFieldId).subscribe(
      res => {
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(
          res => {
            this.currentPacket = res;
            for (let k = 0; k < this.hPackets.length; k++)
              if (this.hPackets[k].id == this.currentPacket.id)
                this.hPackets[k] = this.currentPacket;
            this.ngOnChanges();
            this.hPacketsOutput.emit(this.hPackets);
            this.resetForm('ADD');
            this.pageStatus = PageStatusEnum.Submitted;
          }
        )
        //this.updatePacketViewDelete(this.currentPacket.fields, this.deleteFieldId);
        // this.ngOnChanges();
      },
      err => { }
    )
  }

  confDelete(cd: boolean): void {
    if (cd)
      this.deleteField();
    this.deleteModal = false;
  }

  editField(event) {
    this.treeView.refresh(this.packetTree, this.currentPacket.name);
    this.currentField = event.data;
    this.resetForm('UPDATE');
    this.formStatus = FormStatusEnum.Editable;
    this.fieldForm.setValue({
      fieldName: this.currentField.name,
      fieldMultiplicity: this.currentField.multiplicity,
      fieldType: this.currentField.type,
      fieldDescription: this.currentField.description
    });
  }

  cancelField() {
    this.formStatus = FormStatusEnum.SelectAction;
    this.resetForm('ADD');
  }

  resetForm(type: string) {
    this.submitType = type;
    if (this.submitType == 'UPDATE' && this.currentField.type == 'OBJECT')
      this.fieldForm.get('fieldType').disable();
    else
      this.fieldForm.get('fieldType').enable();
    this.formStatus = FormStatusEnum.SelectAction;
    if (this.fieldForm)
      this.fieldForm.reset();
  }

}
