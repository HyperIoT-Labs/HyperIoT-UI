import {
    Directive,
    EventEmitter,
    HostBinding,
    Input,
    Output,
} from '@angular/core';
import {
    DialogLayout,
    DialogContentModel as DialogContentModel,
    DialogConfig,
} from './model/dialog-model';
import { DialogRef } from './dialog-ref';
import { Logger, LoggerService } from 'core';

@Directive()
export abstract class BaseDialogComponent {
    // assign class to host component
    @HostBinding('class.base-dialog') Dialog: boolean = true;
    // content dialog
    @Input() dialogContent: DialogContentModel | undefined = undefined;

    public logger: Logger = new Logger(this.loggerService);
    public componentName: string = '';

    // layout data
    layout: DialogLayout = {
        width: '60%',
        height: '60%',
        minWidth: '320px',
        minHeight: '180px',
        maxWidth: 'auto',
        maxHeight: 'auto',
    };

    // output click dialog
    @Output() clickFn: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        protected loggerService: LoggerService,
        readonly dialogConfig: DialogConfig,
        readonly dialogRef: DialogRef<any>
    ) {

        const dialogExtra = dialogConfig?.extra;
        this.componentName = this.constructor.name;

        if (dialogExtra) {
            if (dialogExtra.width) {
                this.layout.width = dialogExtra.width;
            }
            if (dialogExtra.height) {
                this.layout.height = dialogExtra.height;
            }
            if (dialogExtra.minHeight) {
                this.layout.minHeight = dialogExtra.minHeight;
            }
            if (dialogExtra.maxHeight) {
                this.layout.maxHeight = dialogExtra.maxHeight;
            }
            if (dialogExtra.minWidth) {
                this.layout.minWidth = dialogExtra.minWidth;
            }
            if (dialogExtra.maxWidth) {
                this.layout.maxWidth = dialogExtra.maxWidth;
            }
        }
        this.logger;
    }

    appendClasses: string = '';

    clickCallback(value: any = null) {
        console.log(value);
        this.clickFn.emit(value);
    }
}
