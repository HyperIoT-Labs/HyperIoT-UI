import { ComponentType } from '@angular/cdk/portal';

export enum DynamicAction {
    Add,
    Delete,
    Update,
    Upload,
}

export interface DialogHeaderModel {
    label?: string;
    icon?: string;
    className?: string;
    classNameIcon?: string;
}

export interface DialogBodyModel {
    value: any;
    icon?: string;
    className?: string;
    classNameIcon?: string;
}

export interface DialogButtons {
    label: string;
    action: () => {};
}

export interface DialogFooterModel {
    buttons: DialogButtons[];
}

export interface DialogContentModel {
    header?: DialogHeaderModel;
    body?: DialogBodyModel;
    footer?: DialogFooterModel;
}

export interface DialogLayout {
    width: string | number;
    height: string | number;
    minWidth: string | number;
    minHeight: string | number;
    maxWidth: string | number;
    maxHeight: string | number;
}

export interface BaseDialogConfig {
    extra?: DialogExtra;
}

export interface DynamicDialogConfig extends BaseDialogConfig {
    header?: DialogHeaderModel;
    footer?: DialogFooterModel;
}

export interface ConfirmDialogConfig extends BaseDialogConfig {
    header?: DialogHeaderModel;
    text?: string;
    confirmLabel?: string;
    rejectLabel?: string;
}

export interface DialogConfig extends BaseDialogConfig {
    action?: DynamicAction;
    component?: {
        data?: any;
        content: ComponentType<any>;
    };
    config?: DialogContentModel;
}
export interface DialogExtra {
    backgroundClosable?: boolean;
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
    verticalPosition?: 'top' | 'center' | 'bottom';
    horizontalPosition?: 'left' | 'center' | 'right';
    panelClass?: string;
    backdropClass?: string;
    openAnimation?: boolean;
    customOpenAnimation?: {
        keyframes: Keyframe[];
        keyframeAnimationOptions: KeyframeAnimationOptions;
    }
    closeAnimation?: boolean;
    customCloseAnimation?: {
        keyframes: Keyframe[];
        keyframeAnimationOptions: KeyframeAnimationOptions;
    }
    attachTarget?: any;
    hideBackdrop?: boolean;
}

export interface BaseDialogResponse {
    
}