import {
    ConnectedPosition,
    Overlay,
    PositionStrategy,
  } from "@angular/cdk/overlay";
  import { Injectable, Injector, NgZone } from "@angular/core";
  import { DialogService } from "../hyt-dialog/dialog.service";
  import {
    DialogLayout,
    DialogConfig,
    DialogOpenModel,
  } from "../hyt-dialog/dialog.models";
  import { ComponentType } from "ngx-toastr";
  import { DialogRef } from "../hyt-dialog/dialog-ref";
  
  @Injectable({
    providedIn: "root",
  })
  export class OverlayService extends DialogService {
    dialogRef: DialogRef<any>;
  
    attachTarget: HTMLElement;
  
    constructor(overlay: Overlay, injector: Injector, zone: NgZone) {
      super(overlay, injector, zone);
    }
  
    override open<T, D = any, R = any>(
      component: ComponentType<T>,
      config?: DialogConfig<D>
    ): DialogOpenModel<R> {
      //scrollStrategy fixed to reposition
      config.scrollStrategy = this.overlay.scrollStrategies.reposition();
  
      this.attachTarget = config.attachTarget;
      //always need to set a min-width and min-height
      if (!config.minHeight) {
        config.minHeight = "150px";
      }
      if (!config.minWidth) {
        config.minWidth = "350px";
      }
      if (!config.maxWidth) {
        config.maxWidth = "500px";
      }
      const dialogOpen = super.open(component, config);
      this.dialogRef = dialogOpen.dialogRef;
      const overlay = this.overlayElement;
      if (overlay) {
        overlay.style.background = "transparent";
        overlay.style.border = "none";
        overlay.style.boxShadow = "none";
        overlay.style.overflowY = "inherit";
        const triggerRect = this.attachTarget.getBoundingClientRect();
  
        // If overlay is render outside of the screen because is on the right side
        // i fix it gaining 15px from right
        // if (triggerRect.right - overlay.offsetWidth) {
        //   overlay.parentElement.style.left = "auto";
        //   overlay.parentElement.style.right = "15px";
        // }
      }
      // setInterval(() => {
      //   dialogOpen.overlayRef.updatePosition();
      // }, 10);
      return dialogOpen;
    }
  
    get overlayElement(): HTMLElement {
      return document.querySelector("hyt-dialog-container") as HTMLElement;
    }
  
    override _getPositionStrategy(
      overlayConfig?: DialogLayout
    ): PositionStrategy {
      return this.overlay
        .position()
        .flexibleConnectedTo(overlayConfig.attachTarget)
        .withFlexibleDimensions(true)
        .withDefaultOffsetX(15)
        .withDefaultOffsetY(15)
        .withViewportMargin(15)
        .withPositions(this.overlayPositions);
    }
  
    get overlayPositions(): ConnectedPosition[] {
      return [
        // Preferred position: Below the trigger element
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
        },
        // If there's not enough space below, try above
        {
          originX: "start",
          originY: "top",
          overlayX: "start",
          overlayY: "bottom",
        },
        // If space is limited on the right, try to position it to the left of the trigger
        {
          originX: "end",
          originY: "center",
          overlayX: "start",
          overlayY: "center",
        },
      ];
    }
  }