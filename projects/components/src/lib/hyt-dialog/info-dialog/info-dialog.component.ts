import { Component, Inject } from '@angular/core';
import { DialogRef } from '../dialog-ref';
import { DIALOG_DATA } from '../dialog-tokens';
import { InfoDialogConfig, InfoDialogResult } from './info-dialog.model';

@Component({
  selector: 'hyt-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent {

  constructor(
    private dialogRef: DialogRef<InfoDialogResult>,
    @Inject(DIALOG_DATA) public data: InfoDialogConfig,
  ) { }

  close() {
    this.dialogRef.close();
  }

}
