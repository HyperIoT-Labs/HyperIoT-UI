import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from 'components';

@Component({
  selector: 'hyt-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss']
})
export class DeleteConfirmDialogComponent {

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: { title: string; message: string; },
  ) { }

  close(result) {
    this.dialogRef.close(result);
  }

}
