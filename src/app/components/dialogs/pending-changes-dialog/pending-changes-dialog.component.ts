import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from 'components';

@Component({
  selector: 'hyt-pending-changes-dialog',
  templateUrl: './pending-changes-dialog.component.html',
  styleUrls: ['./pending-changes-dialog.component.scss']
})
export class PendingChangesDialogComponent {

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
  ) { }

  close(result) {
    this.dialogRef.close(result);
  }
}
