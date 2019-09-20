import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { ProjectDetailComponent } from './project-detail.component';
import { MatRadioChange } from '@angular/material';

export enum LoadingStatusEnum {
    Ready,
    Loading,
    Saving,
    Error
}

export abstract class ProjectDetailEntity {
    isProjectEntity = true;
    treeHost: ProjectDetailComponent;

    form: FormGroup;
    private originalValue: string;
    private validationError = [];

    LoadingStatus = LoadingStatusEnum;
    loadingStatus = LoadingStatusEnum.Ready;

    constructor(
        public formBuilder: FormBuilder
    ) {
        this.form = this.formBuilder.group({});
        this.originalValue = JSON.stringify(this.form.value);
    }

    canDeactivate(): Observable<any> | boolean {
        if (this.isDirty()) {
          return this.treeHost.openSaveDialog();
        }
        return true;
      }

    save(successCallback: any, errorCallback: any): void { }
    delete(successCallback: any, errorCallback: any): void { }

    isValid(): boolean {
        let valid = true;
        Object.keys(this.form.controls).forEach((field) => {
            valid = valid && this.form.get(field).valid;
        });
        return valid;
    }
    isDirty(): boolean {
        return JSON.stringify(this.form.value) !== this.originalValue;
    }
    getError(field) {
        const err = this.validationError.find((e) => e.field === field);
        return (err && err.message) || '';
    }
    setErrors(err) {
        this.validationError = err.error.validationErrors;
        this.validationError.map((e) => {
          this.form.get(e.field).setErrors({
              validateInjectedError: {
                  valid: false
              }
          });
        });
    }
    resetErrors() {
        this.validationError = [];
    }
    resetForm() {
        this.originalValue = JSON.stringify(this.form.value, this.circularFix);
    }

    protected circularFix = (key: any, value: any) => {
        if (value instanceof MatRadioChange) {
          // TODO: maybe this should be fixed in HyperIoT components library (hyt-radio-button)
          return value.value;
        }
        return value;
    }

}
