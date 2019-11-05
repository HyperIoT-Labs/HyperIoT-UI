import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { MatRadioChange, MatDialog } from '@angular/material';
import { ElementRef, ViewChild, OnInit, Output, EventEmitter, AfterViewInit, Injector } from '@angular/core';
import { SummaryList } from '../project-detail/generic-summary-list/generic-summary-list.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

export enum LoadingStatusEnum {
    Ready,
    Loading,
    Saving,
    Error
}

export abstract class ProjectFormEntity implements OnInit {
    @Output() entityEvent = new EventEmitter<any>();

    entity: any = {};
    entityFormMap: any;
    formTitle = 'Project Form Entity';

    form: FormGroup;
    private originalValue = '{}';
    protected validationError = [];

    // the following 5 fields should implemented by a specific interface
    isProjectEntity = true;
    editMode = false;
    hideDelete = false;
    showCancel = false;
    longDefinition = 'entity long definition';
    summaryList: SummaryList;

    LoadingStatus = LoadingStatusEnum;
    loadingStatus = LoadingStatusEnum.Ready;

    unsavedChangesCallback;

    protected formBuilder: FormBuilder;
    protected dialog: MatDialog;

    constructor(
        injector: Injector,
        @ViewChild('form', { static: true }) private formView: ElementRef
    ) {
        this.formBuilder = injector.get(FormBuilder);
        this.dialog = injector.get(MatDialog);
        this.form = this.formBuilder.group({});
    }

    ngOnInit() {
        this.entity = { ...this.newEntity() };
        //this.serialize();
        // build hint messages
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
    isNew() {
        return !this.entity || !this.entity.id;
    }

    edit(entity?: any, readyCallback?) {
        if (entity) {
            this.entity = { ...entity };
        }
        Object.keys(this.entityFormMap).forEach((key) => {
            this.form.get(key)
                .setValue(this.entity[this.entityFormMap[key].field] || this.entityFormMap[key].default);
        });
        this.resetForm();
        if (readyCallback) {
            readyCallback();
          }
    }
    clone(entity?: any): any {
        const cloned = { ...entity } || this.entity;
        cloned.id = 0;
        cloned.entityVersion = 1;
        cloned.name = `${cloned.name} (copy)`;
        this.edit(cloned);
        this.originalValue = '';
        return cloned;
    }

    newEntity() {
        const entity = {};
        // create default entity object
        if (this.entityFormMap) {
            const keys = Object.keys(this.entityFormMap);
            keys.map((k) => {
                const f = this.entityFormMap[k];
                if (f.field)
                    entity[f.field] = f.default;
            });
        }
        return entity;
    }

    isValid(): boolean {
        let invalid = false;
        Object.keys(this.form.controls).forEach((field) => {
            invalid = invalid || this.form.get(field).invalid;
        });
        return !invalid;
    }
    isDirty(): boolean {
        return this.serialize() !== this.originalValue;
    }

    getError(field) {
        const err = this.validationError.find((e) => e.field == field);
        return err && err.message;
    }
    setErrors(err) {
        if (err.error && err.error.validationErrors) {
            this.validationError = err.error.validationErrors;
            this.validationError.map((e) => {
                // TODO: this is a temporary patch to deal
                // TODO: with wrong field names in error response
                if (this.entityFormMap) {
                    const keys = Object.keys(this.entityFormMap);
                    for (let k of keys) {
                        if (this.entityFormMap[k].field === e.field) {
                            e.field = k;
                            break;
                        }
                    }
                }
                // ^^^^^^
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
        this.originalValue = this.serialize();
        this.buildHintMessages();
    }

    cleanForm(): void {
        this.entity = {};
        this.form.reset();
        this.edit();
    }

    private serialize() {
        const keys = Object.keys(this.form.value);
        keys.sort((a, b) => {
            return a > b ? 1 : (a === b ? 0 : -1);
        });
        const copy = {};
        keys.forEach((k) => {
            copy[k] = this.form.value[k];
        });
        return JSON.stringify(copy, this.circularFix);
    }

    private buildHintMessages() {
        const hintElements =
            (this.formView.nativeElement as Element)
                .querySelectorAll('[hintMessage]');
        hintElements.forEach((el: Element) => {
            const message = el.getAttribute('hintMessage');
            const tmp = el.querySelector('.hyt-input,mat-select');
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

    openDeleteDialog(successCallback?: any, errorCallback?: any) {
        const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
            data: { title: 'Delete item?', message: 'This operation cannot be undone.' }
            //@I18N@
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'delete') {
                this.delete(successCallback, errorCallback);
            }
        });
    }

}
