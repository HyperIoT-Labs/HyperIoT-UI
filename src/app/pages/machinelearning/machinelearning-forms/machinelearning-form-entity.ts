import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import {OnInit, Output, EventEmitter, Injector, AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { EntitiesService } from 'src/app/services/entities/entities.service';
import { HytModalService } from 'components';
import { AlgorithmService } from 'src/app/services/algorithms/algorithm.service';
import {MatRadioChange} from '@angular/material/radio';

export enum LoadingStatusEnum {
    Ready,
    Loading,
    Saving,
    Error
}
@Component({
  selector: 'hyt-machinelearning-form-entity',
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export abstract class MachineLearningFormEntity implements OnInit, AfterViewInit {
    @Output() entityEvent = new EventEmitter<any>();

    entity: any = {};
    entityFormMap: any;
    form: FormGroup;
    formTitle = 'Algorithm Form Entity';
    private originalValue = '{}';
    protected validationError = [];

    // the following 5 fields should implemented by a specific interface
    isProjectEntity = true;
    editMode = false;
    hideDelete = false;
    showSave = true;
    showCancel = false;
    formTemplateId = '';
    longDefinition = 'entity long definition';
    icon = '';

    LoadingStatus = LoadingStatusEnum;
    loadingStatus = LoadingStatusEnum.Ready;

    unsavedChangesCallback;

    protected formBuilder: FormBuilder;
    protected dialog: HytModalService;
    protected entitiesService: EntitiesService;
	protected algorithmService: AlgorithmService;

    constructor(
        injector: Injector,
        private cd: ChangeDetectorRef
    ) {
        this.formBuilder = injector.get(FormBuilder);
        this.entitiesService = injector.get(EntitiesService);
        this.dialog = injector.get(HytModalService);
        this.form = this.formBuilder.group({});
		this.algorithmService = injector.get(AlgorithmService);
    }

    ngOnInit() {
        this.entity = { ...this.newEntity() };
    }

    ngAfterViewInit() {
        this.cd.detectChanges();
        this.buildHintMessages();
    }

    private buildHintMessages() {
        const hintElements =
            // (this.formView.nativeElement as Element)
            document.querySelectorAll(`#${this.formTemplateId} [hintMessage]`);

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

    canDeactivate(): Observable<any> | boolean {
        if (this.isDirty() && typeof this.unsavedChangesCallback === 'function') {
            return this.unsavedChangesCallback();
        }
        return true;
    }

    cancel(): void { }

    protected circularFix = (key: any, value: any) => {
        if (value instanceof MatRadioChange) {
            // TODO: maybe this should be fixed in HyperIoT components library (hyt-radio-button)
            return value.value || value;
        }
        return value;
    }

    clone(entity?: any): any {
        console.log();
        const cloned = { ...entity } || this.entity;
        cloned.id = 0;
        cloned.entityVersion = 1;
        cloned.name = `${cloned.name} (copy)`;
        this.edit(cloned);
        this.originalValue = '';
        return cloned;
    }

    delete(successCallback: any, errorCallback: any): void { }

    edit(entity?: any, readyCallback?) {
        if (entity) {
            this.entity = { ...entity };
        }
        Object.keys(this.entityFormMap).forEach((key) => {
            if (this.form.get(key)) {
                this.form.get(key)
                    .setValue(this.entity[this.entityFormMap[key].field]);
            }
        });
        if (readyCallback) {
            readyCallback();
        }
        this.resetForm();
    }

    protected getUser = () => {
        let currentUser;
        if (localStorage.getItem('user')) {
            currentUser = JSON.parse(localStorage.getItem('user'));
        }
        return { id: currentUser.id, entityVersion: currentUser.entityVersion };
    }

    isDirty(): boolean {
        return (this.originalValue === '{}') ? false : this.serialize() !== this.originalValue;
    }

    isNew() {
        return !this.entity || !this.entity.id;
    }

    isValid(): boolean {
        let invalid = false;
        Object.keys(this.form.controls).forEach((field) => {
            invalid = invalid || this.form.get(field).invalid;
        });
        return !invalid;
    }

    load(): void { }

    loadEmpty(): void { }

    newEntity() {
        const entity = {};
        // create default entity object
        if (this.entityFormMap) {
            const keys = Object.keys(this.entityFormMap);
            keys.map((k) => {
                const f = this.entityFormMap[k];
                if (f.field) {
                    entity[f.field] = f.default;
                }
            });
        }
        return entity;
    }

    save(successCallback: any, errorCallback: any): void { }

    getError(field) {
        const err = this.validationError.find((e) => e.field === field);
        return err && err.message;
    }

    openDeleteDialog(successCallback?: any, errorCallback?: any) {
        const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
            data: { title: $localize`:@@HYT_delete_item_question:Do you really want to delete this item?`, message: $localize`:@@HYT_operation_can_not_be_undone:This operation can not be undone`}
        });
        dialogRef.onClosed.subscribe((result) => {
            if (result === 'delete') {
                this.delete(successCallback, errorCallback);
            }
        });
    }

    resetForm() {
        this.originalValue = this.serialize();
        // this.buildHintMessages();
    }

    resetErrors() {
        this.validationError = [];
    }

    setErrors(err) {
        if (err.error && err.error.validationErrors) {
            this.validationError = err.error.validationErrors;
            this.validationError.map((e) => {
                // TODO: this is a temporary patch to deal
                // TODO: with wrong field names in error response
                if (this.entityFormMap) {
                    const keys = Object.keys(this.entityFormMap);
                    for (const k of keys) {
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

}
