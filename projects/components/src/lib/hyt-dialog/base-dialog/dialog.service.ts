import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogRef } from './dialog-ref';
import {
    DIALOG_DATA_TOKEN,
    DIALOG_OVERLAY_COMPONENT_REF_TOKEN,
} from './dialog-tokens';
import { BaseDialogConfig, DialogExtra } from './model/dialog-model';

@Injectable({
    providedIn: 'root',
})
export abstract class DialogService {
    protected dialogType?: ComponentType<any>;

    constructor(
        protected overlay: Overlay,
        protected injector: Injector,
        protected zone: NgZone
    ) {}

    protected _openDialog<T>(dialogConfig?: BaseDialogConfig): DialogRef<T> {
        const overlayRef: OverlayRef = this._createOverlay(dialogConfig?.extra);

        const dialogRef: DialogRef<T> = this._createDialogRef<T>(
            overlayRef,
            dialogConfig?.extra
        );

        // Create injector to be able to reference the DialogRef from within the component
        const injector: Injector = this._createInjector<T>(
            dialogRef,
            dialogConfig
        );

        // Attach component portal to the overlay
        if (!this.dialogType) {
            throw 'dialogType not initialized';
        }
        const portal = new ComponentPortal(this.dialogType, null, injector);

        // Prevents attach invalidation issues when the event trigger source comes from the component of ChangeDetectionStrategy.OnPush
        this.zone.run(() => overlayRef.attach(portal));

        return dialogRef;
    }

    protected _animateOverlayRef(overlayRef: OverlayRef, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
        return overlayRef.overlayElement.animate(keyframes, options);
    }

    protected _createOverlay(extra?: DialogExtra): OverlayRef {

        let positionStrategy;

        if (extra?.attachTarget) {
            positionStrategy = this.overlay
                .position()
                .flexibleConnectedTo(extra.attachTarget).withPositions([
                    {
                      originX: "center",
                      originY: "bottom",
                      overlayX: "center",
                      overlayY: "bottom"
                    }
                  ]);
        } else {
            // Globally centered position strategy
            positionStrategy = this.overlay
                .position()
                .global()
                .centerHorizontally()
                .centerVertically();

            // TODO invece delle prossime riche si potrebbe usare positionStrategy[extra?.horizontalPosition]() ?
            if (extra?.horizontalPosition) {
                if (extra?.horizontalPosition == 'left') {
                    positionStrategy.left();
                } else if (extra?.horizontalPosition == 'right') {
                    positionStrategy.right();
                }
            }

            if (extra?.verticalPosition) {
                if (extra?.verticalPosition == 'top') {
                    positionStrategy.top();
                } else if (extra?.verticalPosition == 'bottom') {
                    positionStrategy.bottom();
                }
            }
        }

        // Block scroll strategy
        const scrollStrategy = this.overlay.scrollStrategies.noop();

        // Create the overlay with customizable options
        const overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy,
            hasBackdrop: !extra?.hideBackdrop,
            backdropClass: extra?.backdropClass,
            panelClass: extra?.panelClass,
            height: extra?.height,
            width: extra?.width,
            minWidth: extra?.minWidth,
            minHeight: extra?.minHeight,
            maxWidth: extra?.maxWidth,
            maxHeight: extra?.maxHeight,
        });

        // handle open animations
        if (
            extra?.openAnimation === undefined ||
            extra?.openAnimation === true
        ) {
            let keyframes: Keyframe[];
            let options: KeyframeAnimationOptions;

            if (extra?.customOpenAnimation) {
                keyframes = extra?.customOpenAnimation?.keyframes;
                options = extra?.customOpenAnimation?.keyframeAnimationOptions;
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

    protected _createDialogRef<T>(
        overlayRef: OverlayRef,
        extraConfig?: DialogExtra
    ): DialogRef<T> {
        const dialogRef = new DialogRef<T>(overlayRef, extraConfig?.backgroundClosable);

        // handle close animations
        if (extraConfig?.closeAnimation && extraConfig?.customCloseAnimation) {
            const _afterClosed = new Subject<T>();
            const closeFunction = dialogRef.close;
            const closeHandler = (dialogResult?: T) => {
                _afterClosed.next(dialogResult);
                const cloaseAnimation = this._animateOverlayRef(
                    overlayRef,
                    extraConfig?.customCloseAnimation?.keyframes,
                    extraConfig?.customCloseAnimation?.keyframeAnimationOptions
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

    protected _createInjector<T>(
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
            ],
        });
    }
}
