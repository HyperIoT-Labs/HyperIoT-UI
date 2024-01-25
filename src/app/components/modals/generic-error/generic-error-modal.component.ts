import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { DIALOG_DATA, DialogRef } from 'components';

@Component({
  selector: 'hyt-generic-error-modal',
  templateUrl: './generic-error-modal.component.html',
  styleUrls: ['./generic-error-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenericErrorModalComponent {

  constructor(
    private dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: { message: string; }
  ) { }

  close() {
    this.dialogRef.close();
  }

}
