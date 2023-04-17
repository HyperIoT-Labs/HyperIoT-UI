import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, Component, ComponentFactoryResolver, Inject, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'core';

import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { DialogRef } from '../base-dialog/dialog-ref';
import { DIALOG_COMPONENT, DIALOG_COMPONENT_DATA, DIALOG_DATA_TOKEN, DIALOG_OVERLAY_COMPONENT_REF_TOKEN } from '../base-dialog/dialog-tokens';
import { DynamicDialogConfig } from '../base-dialog/model/dialog-model';
import { DDComponentDirective } from './DDComponent.directive';
import { DynamicDialogResult } from './dynamic-dialog.service';

@Component({
    selector: 'hwk-dynamic-dialog',
    templateUrl: './dynamic-dialog.component.html',
    styleUrls: ['./dynamic-dialog.component.scss'],
})
export class DynamicDialogComponent
    extends BaseDialogComponent
    implements OnInit
{

    @ViewChild(DDComponentDirective, {static: true}) ddComponent!: DDComponentDirective;

    constructor(
        protected loggerService: LoggerService,
        @Inject(DIALOG_OVERLAY_COMPONENT_REF_TOKEN) readonly dialogRef: DialogRef<DynamicDialogResult>,
        @Inject(DIALOG_DATA_TOKEN) readonly data: DynamicDialogConfig,
        @Inject(DIALOG_COMPONENT) readonly dialogComponent: ComponentType<any>,
        @Inject(DIALOG_COMPONENT_DATA) readonly dialogComponentData: any,
        private cfr: ComponentFactoryResolver
    ) {
        super(loggerService, data, dialogRef);

        this.logger.registerClass(this.componentName);
    }

    ngOnInit(): void {
        const viewContainerRef = this.ddComponent.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(this.cfr.resolveComponentFactory(this.dialogComponent));
        // todo using interafce for data and onSubmit ?
        try {
            componentRef.instance.data = this.dialogComponentData;
        } catch (error) { }
        if (componentRef.instance.onSubmit) {
            componentRef.instance.onSubmit.subscribe(res => this.close(res));
        }
    }

    close(result?: any) {
        this.dialogRef.close(result);
    }
}
