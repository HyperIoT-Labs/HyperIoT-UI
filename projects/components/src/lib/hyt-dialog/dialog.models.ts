import { ScrollStrategy } from "@angular/cdk/overlay";
import { DialogRef } from "./dialog-ref";
import { OverlayRef } from "@angular/cdk/overlay";

export interface DialogLayout {
  backgroundClosable?: boolean;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  verticalPosition?: "top" | "center" | "bottom";
  horizontalPosition?: "left" | "center" | "right";
  panelClass?: string;
  backdropClass?: string;
  openAnimation?: boolean;
  customOpenAnimation?: {
    keyframes: Keyframe[];
    keyframeAnimationOptions: KeyframeAnimationOptions;
  };
  closeAnimation?: boolean;
  customCloseAnimation?: {
    keyframes: Keyframe[];
    keyframeAnimationOptions: KeyframeAnimationOptions;
  };
  attachTarget?: any;
  hideBackdrop?: boolean;
  keepOpenOnNavigation?: boolean;
  scrollStrategy?: ScrollStrategy;
}

export interface DialogConfig<T = any> extends DialogLayout {
  data?: T | null;
}

export interface DialogOpenModel<R> {
  overlayRef: OverlayRef;
  dialogRef: DialogRef<R>;
}