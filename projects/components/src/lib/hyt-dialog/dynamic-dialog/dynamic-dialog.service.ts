import { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';

import { DialogRef } from '../base-dialog/dialog-ref';
import {
    DIALOG_COMPONENT,
    DIALOG_COMPONENT_DATA,
    DIALOG_DATA_TOKEN,
    DIALOG_OVERLAY_COMPONENT_REF_TOKEN,
} from '../base-dialog/dialog-tokens';
import { DialogService } from '../base-dialog/dialog.service';
import { IDialogService } from '../base-dialog/IDialogService';
import {
    BaseDialogConfig,
    DynamicDialogConfig,
} from '../base-dialog/model/dialog-model';
import { DynamicDialogComponent } from './dynamic-dialog.component';

export type DynamicDialogResult = any;

@Injectable({
    providedIn: 'root',
})
export class DynamicDialogService
    extends DialogService
    implements IDialogService
{
    dialogType: ComponentType<any> = DynamicDialogComponent;
    private componentToInject?: ComponentType<any>;
    private componentData?: any;

    /**
     * Open a custom component in an overlay
     */
    openDialog(
        component: ComponentType<any>,
        componentData?: any,
        dialogConfig?: DynamicDialogConfig
    ): DialogRef<DynamicDialogResult> {
        this.componentToInject = component;
        this.componentData = componentData;
        return super._openDialog(dialogConfig);
    }

    protected override _createInjector<T>(
        dialogRef: DialogRef<T>,
        dialogConfig?: BaseDialogConfig
    ) {
        return Injector.create({
            parent: this.injector,
            providers: [
                {
                    provide: DIALOG_OVERLAY_COMPONENT_REF_TOKEN,
                    useValue: dialogRef,
                },
                { provide: DIALOG_DATA_TOKEN, useValue: dialogConfig },
                { provide: DIALOG_COMPONENT, useValue: this.componentToInject },
                { provide: DIALOG_COMPONENT_DATA, useValue: this.componentData },
            ],
        });
    }
}
