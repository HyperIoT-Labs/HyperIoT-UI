import { Component } from '@angular/core';
import {  DialogRef } from 'components';
import { AlarmWrapperService, HytAlarm, Logger, LoggerService } from 'core';

@Component({
  selector: 'hyt-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent {
  /** Notification active get from alarmWrapperService */
  eventNotificationIsOn : boolean;
  /** HYOT logger */
  private logger: Logger

  constructor(
    private dialogRef: DialogRef<any>,
    private alarmWrapper: AlarmWrapperService,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("NotificationDialogComponent");
    this.eventNotificationIsOn = alarmWrapper.eventNotificationState.getValue();
  }

  close() {
    this.dialogRef.close();
  }

  get alarmListArray() : HytAlarm.LiveAlarm[]{
    return this.alarmWrapper.alarmListArray;
  }

  get alarmListToRemove() {
    return this.alarmWrapper.alarmListToRemove;
  }

  /**
   * Set off the notification is active OR viceversa
   */
  changeEventNotificationState() {
    this.eventNotificationIsOn = !this.eventNotificationIsOn;
    this.logger.info("changeEventNotificationState - new status", this.eventNotificationIsOn);
    this.alarmWrapper.eventNotificationState.next(this.eventNotificationIsOn);
  }

}
