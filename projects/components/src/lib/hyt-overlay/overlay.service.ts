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
  
        // If overlay is render outside of the screen because is on the right side
        // i fix it gaining 15px of from right
        if (
          window.innerWidth -
            this.attachTarget.getBoundingClientRect().x -
            overlay.offsetWidth <
          0
        ) {
          const overlayStyleId = "overlayCustomStyle";
          if (document.getElementById(overlayStyleId))
            document.getElementById(overlayStyleId).remove();
  
          var style = document.createElement("style");
          style.id = overlayStyleId;
          style.innerHTML = `.fixOverlayLeftPositioning { left: ${
            window.innerWidth - overlay.offsetWidth - 15
          }px !important; }`;
          document.getElementsByTagName("head")[0].appendChild(style);
          dialogOpen.overlayRef.addPanelClass("fixOverlayLeftPositioning");
        }
      }
      dialogOpen.overlayRef.outsidePointerEvents().subscribe({
        next: (value) => {
          dialogOpen.dialogRef.close();
        }
      });
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
        .withViewportMargin(15)
        .withPositions(this.overlayPositions);
    }
  
    get overlayPositions(): ConnectedPosition[] {
      return [
        // Preferred position: Below the trigger element (bottom right)
        {
          originX: "center",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
        },
        // (top right)
        {
          originX: "center",
          originY: "top",
          overlayX: "start",
          overlayY: "bottom",
        },
        // (bottom left)
        {
          originX: "center",
          originY: "bottom",
          overlayX: "end",
          overlayY: "top",
        },
        // (top left)
        {
          originX: "center",
          originY: "top",
          overlayX: "end",
          overlayY: "bottom",
        },
      ];
    }
  }