import { DialogRef } from './dialog-ref';
import { DialogConfig } from './model/dialog-model';

export interface IDialogService {
    /**
     * Open a custom component in an overlay
     */
    openDialog(dialogConfig?: any): DialogRef<any>;
}
