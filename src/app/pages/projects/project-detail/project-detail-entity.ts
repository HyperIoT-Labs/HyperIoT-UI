import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { ProjectDetailComponent } from './project-detail.component';
import { MatRadioChange } from '@angular/material';
import { ElementRef, ViewChild, OnInit } from '@angular/core';
import { SummaryList } from './generic-summary-list/generic-summary-list.component';

export enum LoadingStatusEnum {
    Ready,
    Loading,
    Saving,
    Error
}

export abstract class ProjectDetailEntity implements OnInit {
    isProjectEntity = true;
    projectHost: ProjectDetailComponent;

    hideDelete = false;

    form: FormGroup;
    private originalValue: string;
    private validationError = [];

    summaryList: SummaryList;

    LoadingStatus = LoadingStatusEnum;
    loadingStatus = LoadingStatusEnum.Ready;

    constructor(
        public formBuilder: FormBuilder,
        @ViewChild('form', { static: true }) private formView: ElementRef
    ) {
        this.form = this.formBuilder.group({});
        this.originalValue = JSON.stringify(this.form.value);
    }

    ngOnInit() {
        this.buildHintMessages();
    }

    canDeactivate(): Observable<any> | boolean {
        if (this.isDirty()) {
            return this.projectHost.openSaveDialog();
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
        return err && err.message;
    }
    setErrors(err) {
        if (err.error && err.error.validationErrors) {
            this.validationError = err.error.validationErrors;
            this.validationError.map((e) => {
                this.form.get(e.field).setErrors({
                    validateInjectedError: {
                        valid: false
                    }
                });
            });
            this.loadingStatus = LoadingStatusEnum.Ready;
        } else {
            this.loadingStatus = LoadingStatusEnum.Error;
        }
    }
    resetErrors() {
        this.validationError = [];
    }

    resetForm() {
        this.originalValue = JSON.stringify(this.form.value, this.circularFix);
        this.buildHintMessages();
    }

    treeView() {
        return {
            refresh: this.projectHost.refresh.bind(this.projectHost),
            focus: (node: { id: any, type?: 'packet-events' | 'packet-statistics' | 'packet-enrichments' | 'packet-fields' | 'packet' | 'device' | 'project' | '' }) =>
                this.projectHost.focus(node),
            updateNode: (nodeData: { id: any, type?: string, name: string }) =>
                this.projectHost && this.projectHost.updateNode(nodeData)
        };
    }

    private buildHintMessages() {
        const hintElements =
            (this.formView.nativeElement as Element)
                .querySelectorAll('[hintMessage]');
        hintElements.forEach((el: Element) => {
            const message = el.getAttribute('hintMessage');
            let tmp = el.querySelector('.hyt-input,mat-select');
            if (tmp == null) {
                return;
                //tmp = el.closest('.mat-radio-group,.radio-options');
                //console.log('2', tmp)
                //if (tmp == null) return;
            }
            el = tmp;
            el.addEventListener('focus', () => {
                this.projectHost.showHintMessage(message);
            });
            el.addEventListener('blur', () => {
                this.projectHost.hideHintMessage();
            });
            // TODO: remove listeners on ngOnDestroy()
            // TODO: remove listeners on ngOnDestroy()
            // TODO: remove listeners on ngOnDestroy()
            // TODO: remove listeners on ngOnDestroy()
        });
    }

    protected circularFix = (key: any, value: any) => {
        if (value instanceof MatRadioChange) {
            // TODO: maybe this should be fixed in HyperIoT components library (hyt-radio-button)
            return value.value || value;
        }
        return value;
    }
}
