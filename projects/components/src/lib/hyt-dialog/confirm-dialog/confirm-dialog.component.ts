import { Component, Inject, OnInit } from '@angular/core';
import { LoggerService } from 'core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { DialogRef } from '../base-dialog/dialog-ref';
import {
    DIALOG_DATA_TOKEN,
    DIALOG_OVERLAY_COMPONENT_REF_TOKEN,
} from '../base-dialog/dialog-tokens';
import { ConfirmDialogConfig } from '../base-dialog/model/dialog-model';
import { ConfirmDialogResult } from './confirm-dialog.service';

@Component({
    selector: 'hwk-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent
    extends BaseDialogComponent
    implements OnInit
{
    constructor(
        protected loggerService: LoggerService,
        @Inject(DIALOG_OVERLAY_COMPONENT_REF_TOKEN)
        readonly dialogRef: DialogRef<ConfirmDialogResult>,
        @Inject(DIALOG_DATA_TOKEN) readonly data: ConfirmDialogConfig
    ) {
        super(loggerService, data, dialogRef);

        this.logger.registerClass(this.componentName);
    }

    ngOnInit(): void {
    }

    accept() {
        this.dialogRef.close('accept');
    }
    reject() {
        this.dialogRef.close('reject');
    }
}
