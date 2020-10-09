import { Component, ViewChild, ElementRef, Injector, ViewEncapsulation, ChangeDetectorRef, Input, AfterViewInit, OnInit } from '@angular/core';

import { Observable, Subject, PartialObserver } from 'rxjs';

import { AlgorithmsService, Algorithm, AlgorithmIOField } from '@hyperiot/core';
import { AlgorithmFormEntity, LoadingStatusEnum } from '../algorithm-form-entity';

import { Option } from '@hyperiot/components';
import { Node, HytTreeViewEditableComponent } from '@hyperiot/components/lib/hyt-tree-view-editable/hyt-tree-view-editable.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'hyt-output-fields-form',
  templateUrl: './output-fields-form.component.html',
  styleUrls: ['./output-fields-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OutputFieldsFormComponent extends AlgorithmFormEntity implements OnInit, AfterViewInit {

  @Input() currentAlgorithmSubject: Subject<Algorithm>;
  output: AlgorithmIOField[];

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

  currentOutputField: AlgorithmIOField;

  outputFieldsTree = [] as Node[];

  formTitle = 'Algorithm Output Fields';

  entityFormMap = {
    'outputField-name': {
      field: 'name',
      default: null
    },
    'outputField-description': {
      field: 'description',
      default: null
    },
    'outputField-type': {
      field: 'fieldType',
      default: null
    },
    'outputField-multiplicity': {
      field: 'multiplicity',
      default: 'SINGLE'
    }
  };

  constructor(
    injector: Injector,
    private algorithmsService: AlgorithmsService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formTemplateId = 'container-output-field';
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
    this.currentOutputField = this.newEntity() as AlgorithmIOField;
    this.showCancel = true;
    this.loadFormData();
  }

  cancel() {
    this.resetForm();
    this.showCancel = false;
    this.currentOutputField = null;
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
      this.currentOutputField = e.data;
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
      this.outputFieldsTree = this.createFieldsTree(res.output);
      if (this.treeViewFields) {
        this.treeViewFields.refresh(this.outputFieldsTree, this.entity.name);
      }
      this.resetForm();
    });
    this.loadingStatus = LoadingStatusEnum.Ready;
  }

  private loadFormData() {
    this.form.get('outputField-name').setValue(this.currentOutputField.name);
    this.form.get('outputField-description').setValue(this.currentOutputField.description);
    this.form.get('outputField-multiplicity').setValue(this.currentOutputField.multiplicity);
    this.form.get('outputField-type').setValue(this.currentOutputField.fieldType);
    // reset form
    this.resetForm();
  }

  private openDelete(fieldId: number) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { title: $localize`:@@HYT_delete_item:Delete item?`, message: $localize`:@@HYT_operation_cannot_be_undone:This operation cannot be undone.` }
    });
    dialogRef.onClosed.subscribe((result) => {
      if (result === 'delete') {
        if (this.currentOutputField && this.currentOutputField.id === fieldId) {
          this.currentOutputField = null;
        }
        this.algorithmsService.deleteIOField(this.entity.id, AlgorithmIOField.TypeEnum.OUTPUT, fieldId).subscribe(
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
    this.currentOutputField.name = this.form.get('outputField-name').value;
    this.currentOutputField.description = this.form.get('outputField-description').value;
    this.currentOutputField.multiplicity = this.form.get('outputField-multiplicity').value;
    this.currentOutputField.fieldType = this.form.get('outputField-type').value;
    this.currentOutputField.type = AlgorithmIOField.TypeEnum.OUTPUT;
    let saveObservable: Observable<any>;
    if (this.currentOutputField.id > 0) {
      saveObservable = this.algorithmsService
        .updateIOField(this.entity.id, this.currentOutputField);
    } else {
      saveObservable = this.algorithmsService
        .addIOField(this.entity.id, this.currentOutputField);
    }
    saveObservable.subscribe((res) => {
      this.currentOutputField = null; // closes the field editing form
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
            { message: $localize`:@@HYT_unavailable_output_field_name:Unavailable output field name`, field: 'outputField-name', invalidValue: '' }];
          this.form.get('outputField-name').setErrors({
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
