import { Component, Input, Output, EventEmitter, Injector, Inject } from '@angular/core';
import { DIALOG_DATA } from '../../hyt-dialog/dialog-tokens';
import { DialogRef } from '../../hyt-dialog/dialog-ref';

@Component({
  selector: 'hyt-info-recording-action',
  templateUrl: './hyt-info-recording-action.component.html',
  styleUrls: ['./hyt-info-recording-action.component.scss']
})
export class HytInfoRecordingActionComponent {

  constructor(
    private dialogRef: DialogRef<'confirm' | 'cancel'>,
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  close(result: 'confirm' | 'cancel') {
    this.dialogRef.close(result);
  }

}
