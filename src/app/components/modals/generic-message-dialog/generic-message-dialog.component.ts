import { Component, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from 'components';

@Component({
  selector: 'hyt-generic-message-dialog',
  templateUrl: './generic-message-dialog.component.html',
  styleUrls: ['./generic-message-dialog.component.scss']
})
export class GenericMessageDialogComponent implements OnInit {

  constructor(
    private dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: { message: string; },
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
