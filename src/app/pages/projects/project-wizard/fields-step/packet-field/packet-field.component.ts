import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { HPacket, HPacketField, HpacketsService } from '@hyperiot/core';
import { HytTreeViewEditableComponent, Node } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PageStatusEnum } from '../../model/pageStatusEnum';
import { Option, SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

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


  @ViewChild('treeView', { static: false }) treeView: HytTreeViewEditableComponent;

  packetTree: Node[];

  currentField;

  fieldForm: FormGroup;

  submitType: string = 'ADD';

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  formStatus: FormStatusEnum = FormStatusEnum.SelectAction;

  multiplicityOptions: Option[] = [
    { value: 'SINGLE', label: this.i18n('HYT_single'), checked: true },
    { value: 'ARRAY', label: this.i18n('HYT_array') },
    { value: 'MATRIX', label: this.i18n('HYT_matrix') }
  ];

  typeOptions: SelectOption[] = [
    { value: 'OBJECT', label: this.i18n('HYT_object') },
    { value: 'INTEGER', label: this.i18n('HYT_integer') },
    { value: 'DOUBLE', label: this.i18n('HYT_double') },
    { value: 'FLOAT', label: this.i18n('HYT_float') },
    { value: 'BOOLEAN', label: this.i18n('HYT_boolean') },
    { value: 'DATE', label: this.i18n('HYT_date') },
    { value: 'TEXT', label: this.i18n('HYT_text') },
    { value: 'TIMESTAMP', label: this.i18n('HYT_timestamp') },
    { value: 'CATEGORY', label: this.i18n('HYT_category') },
    { value: 'TAG', label: this.i18n('HYT_tag') }
  ];

  errors: HYTError[] = [];

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService,
    private wizardService: ProjectWizardService,
    private i18n: I18n
  ) { }

  ngOnInit() {
    this.fieldForm = this.fb.group({});
  }

  updateTree() {
    let apacketTree = [...this.createPacketTree(this.wizardService.treefyById(this.currentPacket.id))];
    if (this.treeView)
      this.treeView.refresh(apacketTree, this.currentPacket.name);
    else
      this.packetTree = [...apacketTree];
    this.resetForm('ADD');
    this.pageStatus = PageStatusEnum.Submitted;
  }

  ngOnChanges() {
    if (this.currentPacket && this.currentPacket.id)
      this.updateTree();
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
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(//TODO OPTIMIZATION
          (res: HPacket) => {
            this.wizardService.updatePacket(res);
            this.updateTree();
          }
        )
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

    this.hPacketService.updateHPacketField(this.currentPacket.id, field).subscribe(
      res => {
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(//TODO OPTIMIZATION
          (res: HPacket) => {
            this.wizardService.updatePacket(res);
            this.updateTree();
          }
        )
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
    this.hPacketService.deleteHPacketField(this.deleteFieldId).subscribe(
      res => {
        this.hPacketService.findHPacket(this.currentPacket.id).subscribe(//TODO OPTIMIZATION
          (res: HPacket) => {
            this.wizardService.updatePacket(res);
            this.updateTree();
          }
        )
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

  updateHint(event: string) {
    this.wizardService.updateHint(event, 3);
  }

}
