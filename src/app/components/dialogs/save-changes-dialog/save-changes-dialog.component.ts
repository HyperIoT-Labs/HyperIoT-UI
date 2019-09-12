import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'hyt-save-changes-dialog',
  templateUrl: './save-changes-dialog.component.html',
  styleUrls: ['./save-changes-dialog.component.scss']
})
export class SaveChangesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SaveChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

}
