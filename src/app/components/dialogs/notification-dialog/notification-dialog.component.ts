import { Component } from '@angular/core';
import {  DialogRef } from 'components';
import { AlarmWrapperService } from 'core';

@Component({
  selector: 'hyt-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent {

  constructor(
    private dialogRef: DialogRef<any>,
    private alarmWrapper: AlarmWrapperService
  ) {}

  close() {
    this.dialogRef.close();
  }

}
