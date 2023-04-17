import { Overlay } from '@angular/cdk/overlay';
import { Injectable, Injector, NgZone } from '@angular/core';
import { DialogRef } from '../base-dialog/dialog-ref';
import { DIALOG_DATA_TOKEN, DIALOG_OVERLAY_COMPONENT_REF_TOKEN } from '../base-dialog/dialog-tokens';
import { IDialogService } from '../base-dialog/IDialogService';
import { DialogConfig } from '../base-dialog/model/dialog-model';

export type DialogResult = any;

@Injectable({
  providedIn: 'root',
})
export class DialogService implements IDialogService {
  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private zone: NgZone,
  ) { }

  /**
   * Open a custom component in an overlay
   */
  openDialog(dialogConfig?: DialogConfig): DialogRef<DialogResult> {

    // Globally centered position strategy
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    // Create the overlay with customizable options
    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: ['overlay-backdrop'],
      panelClass: ['overlay-panel'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    // Create dialogRef to return
    const dialogRef = new DialogRef(overlayRef);

    // Create injector to be able to reference the DialogRef from within the component
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DIALOG_OVERLAY_COMPONENT_REF_TOKEN, useValue: dialogRef },
        { provide: DIALOG_DATA_TOKEN, useValue: dialogConfig },
      ],
    });

    // Attach component portal to the overlay
    // const portal = new ComponentPortal(DialogComponent, null, injector);

    // Prevents attach invalidation issues when the event trigger source comes from the component of ChangeDetectionStrategy.OnPush
    // this.zone.run(() => overlayRef.attach(portal));

    return dialogRef;
  }
}
