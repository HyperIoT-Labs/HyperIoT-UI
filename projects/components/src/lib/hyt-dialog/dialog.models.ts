export interface DialogLayout {
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
    keepOpenOnNavigation?: boolean;
}

export interface DialogConfig<T = any> extends DialogLayout {
    data?: T | null;
}
