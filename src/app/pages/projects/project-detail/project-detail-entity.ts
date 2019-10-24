import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { MatRadioChange } from '@angular/material';
import { ElementRef, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { SummaryList } from './generic-summary-list/generic-summary-list.component';

export enum LoadingStatusEnum {
    Ready,
    Loading,
    Saving,
    Error
}
export enum SubmitMethod {
    Post,
    Put
}

export abstract class ProjectDetailEntity implements OnInit {
    @Output() entityEvent = new EventEmitter<any>();
    isProjectEntity = true;

    id: number;

    hideDelete = false;
    showCancel = false;

    form: FormGroup;
    private originalValue: string;
    private validationError = [];

    submitMethod: SubmitMethod = SubmitMethod.Post;

    longDefinition: string = 'entity long definition';

    summaryList: SummaryList;

    LoadingStatus = LoadingStatusEnum;
    loadingStatus = LoadingStatusEnum.Ready;

    unsavedChangesCallback;

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
        if (this.isDirty() && typeof this.unsavedChangesCallback === 'function') {
            return this.unsavedChangesCallback();
        }
        return true;
    }

    load(): void { }
    save(successCallback: any, errorCallback: any): void { }
    delete(successCallback: any, errorCallback: any): void { }
    cancel(): void { }

    isValid(): boolean {
        let invalid = false;
        Object.keys(this.form.controls).forEach((field) => {
            invalid = invalid || this.form.get(field).invalid;
        });
        return !invalid;
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

    cleanForm() {
        this.form.reset();
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
            }
            el = tmp;
            el.addEventListener('focus', () => {
                this.entityEvent.emit({
                    event: 'hint:show',
                    message
                });
            });
            el.addEventListener('blur', () => {
                this.entityEvent.emit({
                    event: 'hint:hide'
                });
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

    protected getUser = () => {
        let currentUser;
        if (localStorage.getItem('user')) {
            currentUser = JSON.parse(localStorage.getItem('user'));
        }
        return { id: currentUser.id, entityVersion: currentUser.entityVersion };
    }
}
