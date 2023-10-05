import { Component, ViewChild, ElementRef, Injector, ViewEncapsulation, ChangeDetectorRef, Input, AfterViewInit, OnInit } from '@angular/core';

import { Observable, Subject, PartialObserver } from 'rxjs';

import { AlgorithmsService, Algorithm, AlgorithmIOField } from 'core';
import { MachineLearningFormEntity, LoadingStatusEnum } from '../machinelearning-form-entity';

import { Option, Node, HytTreeViewEditableComponent } from 'components';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'hyt-input-fields-form',
  templateUrl: './input-fields-form.component.html',
  styleUrls: ['./input-fields-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InputFieldsFormComponent extends MachineLearningFormEntity implements OnInit, AfterViewInit {

  @Input() currentAlgorithmSubject: Subject<Algorithm>;
  input: AlgorithmIOField[];

  private overlayHeight: ElementRef;
  @ViewChild('overlayHeight') set content(content: ElementRef) {
    if (!content) {
      this.showPreloader = false;
      return;
    } else {
      this.showPreloader = true;
      this.overlayHeight = content;
    }
  }

  algorithmObserver: PartialObserver<Algorithm> = {
    next: res => {
      this.entity = res;
      this.loadData();
    }
  };

  showPreloader: boolean;
  divHeight: number;

  @ViewChild('treeViewFields') treeViewFields: HytTreeViewEditableComponent;

  fieldMultiplicityOptions: Option[] = Object.keys(AlgorithmIOField.MultiplicityEnum)
    .map((k) => ({ label: k, value: k }));

  fieldTypeOptions: Option[] = Object.keys(AlgorithmIOField.FieldTypeEnum)
    .map((k) => ({ label: k, value: k }));

  currentInputField: AlgorithmIOField;

  inputFieldsTree = [] as Node[];

  formTitle = 'Algorithm Input Fields';

  entityFormMap = {
    'inputField-name': {
      field: 'name',
      default: null
    },
    'inputField-description': {
      field: 'description',
      default: null
    },
    'inputField-type': {
      field: 'fieldType',
      default: null
    },
    'inputField-multiplicity': {
      field: 'multiplicity',
      default: 'SINGLE'
    }
  };

  constructor(
    injector: Injector,
    private algorithmsService: AlgorithmsService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector,cdr);
    this.formTemplateId = 'container-input-field';
    this.longDefinition = this.entitiesService.algorithm.longDefinition;
    this.formTitle = this.entitiesService.algorithm.formTitle;
    this.icon = this.entitiesService.algorithm.icon;
    this.hideDelete = true;
  }

  ngOnInit() {
    this.currentAlgorithmSubject.subscribe(this.algorithmObserver);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  // fields treeview methods
  addField(e) {
    this.currentInputField = this.newEntity() as AlgorithmIOField;
    this.showCancel = true;
    this.loadFormData();
  }

  cancel() {
    this.resetForm();
    this.showCancel = false;
    this.currentInputField = null;
  }

  private createFieldsTree(nodes: any) {
    if (nodes == null) return null;
    return nodes.map((of: AlgorithmIOField) => ({
      data: of,
      root: false,
      name: of.name,
      lom: of.multiplicity,
      type: of.fieldType
    }));
  }

  editField(e) {
    const proceedWithEdit = () => {
      this.currentInputField = e.data;
      this.showCancel = true;
      this.loadFormData();
    };
    const canDeactivate = this.canDeactivate();
    if (typeof canDeactivate === 'boolean' && canDeactivate === true) {
      proceedWithEdit();
    } else {
      (canDeactivate as Observable<any>).subscribe((res) => {
        if (res) {
          proceedWithEdit();
        }
      });
    }
  }

  loadData() {
    this.algorithmsService.getBaseConfig(this.entity.id).subscribe(res => {
      this.inputFieldsTree = this.createFieldsTree(res.input);
      if (this.treeViewFields) {
        this.treeViewFields.refresh(this.inputFieldsTree, this.entity.name);
      }
      this.resetForm();
    });
    this.loadingStatus = LoadingStatusEnum.Ready;
  }

  private loadFormData() {
    this.form.get('inputField-name').setValue(this.currentInputField.name);
    this.form.get('inputField-description').setValue(this.currentInputField.description);
    this.form.get('inputField-multiplicity').setValue(this.currentInputField.multiplicity);
    this.form.get('inputField-type').setValue(this.currentInputField.fieldType);
    // reset form
    this.resetForm();
  }

  private openDelete(fieldId: number) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { title: $localize`:@@HYT_delete_item:Delete item?`, message: $localize`:@@HYT_operation_cannot_be_undone:This operation cannot be undone.` }
    });
    dialogRef.onClosed.subscribe((result) => {
      if (result === 'delete') {
        if (this.currentInputField && this.currentInputField.id === fieldId) {
          this.currentInputField = null;
        }
        this.algorithmsService.deleteIOField(this.entity.id, AlgorithmIOField.TypeEnum.INPUT, fieldId).subscribe(
          res => {
            this.entityEvent.emit({
              event: 'pw:algorithm-updated',
              algorithm: res
            });
          },
          err => {
            console.log(err);
            // TODO: report error!
          }
        );
      }
    });
  }

  removeField(e) {
    this.openDelete(e.data.id);
  }

  save(successCallback, errorCallback) {
    this.saveAlgorithm(successCallback, errorCallback);
  }

  private saveAlgorithm(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    this.currentInputField.name = this.form.get('inputField-name').value;
    this.currentInputField.description = this.form.get('inputField-description').value;
    this.currentInputField.multiplicity = this.form.get('inputField-multiplicity').value;
    this.currentInputField.fieldType = this.form.get('inputField-type').value;
    this.currentInputField.type = AlgorithmIOField.TypeEnum.INPUT;
    let saveObservable: Observable<any>;
    if (this.currentInputField.id > 0) {
      saveObservable = this.algorithmsService
        .updateIOField(this.entity.id, this.currentInputField);
    } else {
      saveObservable = this.algorithmsService
        .addIOField(this.entity.id, this.currentInputField);
    }
    saveObservable.subscribe((res) => {
      this.currentInputField = null; // closes the field editing form
      this.form.reset();
      this.showCancel = false;
      this.entityEvent.emit({
        event: 'pw:algorithm-updated',
        algorithm: res
      });
      successCallback && successCallback(res, this.entity.id);
    }, (err) => {
      this.setErrors(err);
      errorCallback && errorCallback(err);
    });
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [
            { message: $localize`:@@HYT_unavailable_input_field_name:Unavailable input field name`, field: 'inputField-name', invalidValue: '' }];
          this.form.get('inputField-name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }
  }
}
