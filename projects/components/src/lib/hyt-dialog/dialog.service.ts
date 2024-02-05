import { Overlay, ComponentType, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, NgZone } from '@angular/core';
import { DialogRef } from './dialog-ref';
import { Subject } from 'rxjs';
import { DIALOG_DATA } from './dialog-tokens';
import { DialogConfig, DialogLayout } from './dialog.models';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private zone: NgZone,
  ) {}

  open<T, D = any, R = any>(component: ComponentType<T>, config?: DialogConfig<D>): DialogRef<R> {
    const overlayRef: OverlayRef = this._createOverlay(config);

    const dialogRef: DialogRef<R> = this._createDialogRef<R>(overlayRef, config);

    // Create injector to be able to reference the DialogRef from within the component
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: config?.data },
      ],
    });

    // method 1: Attach component portal to the overlay
    // const portal = new ComponentPortal(component, null, injector);
    // const containerRef = overlayRef.attach(portal);

    // method 2: Attach a Container component before the component to open. This is how angular material works.
    const containerPortal = new ComponentPortal(DialogContainerComponent, null, injector);
    const containerRef = overlayRef.attach(containerPortal);
    const dialogContainer = containerRef.instance;

    const portal = new ComponentPortal(component, null, injector);
    dialogContainer.attachComponentPortal(portal);

    return dialogRef;
  }

  private _animateOverlayRef(overlayRef: OverlayRef, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    return overlayRef.overlayElement.animate(keyframes, options);
  }

  private _createOverlay(overlayConfig?: DialogLayout): OverlayRef {

    let positionStrategy;

    if (overlayConfig?.attachTarget) { // ? dialog should only be global positioned ?
        positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(overlayConfig.attachTarget).withPositions([
                {
                  originX: 'center',
                  originY: 'bottom',
                  overlayX: 'center',
                  overlayY: 'bottom'
                }
              ]);
    } else {
        positionStrategy = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();

        // use positionStrategy[overlayConfig?.horizontalPosition]() instead ?
        if (overlayConfig?.horizontalPosition) {
            if (overlayConfig?.horizontalPosition == 'left') {
                positionStrategy.left();
            } else if (overlayConfig?.horizontalPosition == 'right') {
                positionStrategy.right();
            }
        }

        if (overlayConfig?.verticalPosition) {
            if (overlayConfig?.verticalPosition == 'top') {
                positionStrategy.top();
            } else if (overlayConfig?.verticalPosition == 'bottom') {
                positionStrategy.bottom();
            }
        }
    }

    // Scroll strategy
    const scrollStrategy = overlayConfig?.scrollStrategy || this.overlay.scrollStrategies.block();

    // Create the overlay with customizable options
    const overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy,
        hasBackdrop: !overlayConfig?.hideBackdrop,
        backdropClass: overlayConfig?.backdropClass,
        panelClass: overlayConfig?.panelClass,
        height: overlayConfig?.height,
        width: overlayConfig?.width,
        minWidth: overlayConfig?.minWidth,
        minHeight: overlayConfig?.minHeight,
        maxWidth: overlayConfig?.maxWidth,
        maxHeight: overlayConfig?.maxHeight,
        disposeOnNavigation: !overlayConfig?.keepOpenOnNavigation,
    });

    // handle open animations
    if (
        overlayConfig?.openAnimation === undefined ||
        overlayConfig?.openAnimation === true
    ) {
        let keyframes: Keyframe[];
        let options: KeyframeAnimationOptions;

        if (overlayConfig?.customOpenAnimation) {
            keyframes = overlayConfig?.customOpenAnimation?.keyframes;
            options = overlayConfig?.customOpenAnimation?.keyframeAnimationOptions;
        } else { // applying default open animation
            keyframes = [
                {
                    transform: 'scale(0.88)',
                    opacity: 0,
                    easing: 'ease-out',
                },
                { transform: 'scale(1)', opacity: 1 },
            ];
            options = {
                duration: 130,
            };
        }
        this._animateOverlayRef(overlayRef, keyframes, options);
    }
    return overlayRef;
  }

  protected _createDialogRef<R>(
    overlayRef: OverlayRef,
    overlayConfig?: DialogLayout
  ): DialogRef<R> {
    const dialogRef = new DialogRef<R>(overlayRef, overlayConfig?.backgroundClosable);

    // handle close animations
    // move in DialogRef?
    if (overlayConfig?.closeAnimation && overlayConfig?.customCloseAnimation) {
        const _afterClosed = new Subject<R>();
        const closeFunction = dialogRef.close;
        const closeHandler = (dialogResult?: R) => {
            _afterClosed.next(dialogResult);
            const cloaseAnimation = this._animateOverlayRef(
                overlayRef,
                overlayConfig?.customCloseAnimation?.keyframes,
                overlayConfig?.customCloseAnimation?.keyframeAnimationOptions
            );
            cloaseAnimation.onfinish = () => {
                this.zone.run(() => dialogRef.close(dialogResult));
            }
            dialogRef.close = closeFunction;
        };

        dialogRef.afterClosed = () => _afterClosed.asObservable();
        dialogRef.close = (dialogResult?) => closeHandler(dialogResult);
    }

    return dialogRef;
  }

}
