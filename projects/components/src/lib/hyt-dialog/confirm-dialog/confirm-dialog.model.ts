export interface ConfirmDialogConfig {
    header?: string;
    text?: string;
    dismissable?: string;
    confirmLabel?: string;
    rejectLabel?: string;
}

export type ConfirmDialogResult = {
    result: 'accept' | 'reject';
    dismissed: boolean;
}
