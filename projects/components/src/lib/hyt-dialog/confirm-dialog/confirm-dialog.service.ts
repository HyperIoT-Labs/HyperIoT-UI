import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { DialogRef } from '../base-dialog/dialog-ref';
import { DialogService } from '../base-dialog/dialog.service';
import { IDialogService } from '../base-dialog/IDialogService';
import { ConfirmDialogConfig } from '../base-dialog/model/dialog-model';
import { ConfirmDialogComponent } from './confirm-dialog.component';

export type ConfirmDialogResult = {
    result: 'accept' | 'reject';
    dismissed: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ConfirmDialogService
    extends DialogService
    implements IDialogService
{
    dialogType: ComponentType<any> = ConfirmDialogComponent;

    /**
     * Open a custom component in an overlay
     */
    openDialog(
        dialogConfig?: ConfirmDialogConfig
    ): DialogRef<ConfirmDialogResult> {
        return super._openDialog<ConfirmDialogResult>(dialogConfig);
    }
}
