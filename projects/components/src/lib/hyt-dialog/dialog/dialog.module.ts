import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { DialogComponent } from './dialog.component';
import { DialogService } from '../dialog/dialog.service';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
    declarations: [
        // DialogComponent
    ],
    imports: [
        CommonModule,
        PortalModule,
        OverlayModule
    ],
    exports: [
        // DialogComponent
    ],
    providers: [
        DialogService
    ]
})
export class DialogModule {
}