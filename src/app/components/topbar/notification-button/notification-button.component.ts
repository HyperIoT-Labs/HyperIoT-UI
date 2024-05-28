import { Component } from '@angular/core';
import { DialogRef, OverlayService } from 'components';
import { AlarmWrapperService, Logger, LoggerService } from 'core';
import { NotificationDialogComponent } from '../../dialogs/notification-dialog/notification-dialog.component';

@Component({
  selector: 'hyt-notification-button',
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.scss'],
})
export class NotificationButtonComponent {
  /** Notification active get from alarmWrapperService */
  eventNotificationIsOn : boolean;
  /** Overlay object valorized only when panel is open */
  notificationPanel: DialogRef<any>;
  /** HYOT logger */
  private logger: Logger;
  
  constructor(
    private alarmWrapper: AlarmWrapperService,
    private overlay: OverlayService,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("NotificationButtonComponent");
    this.eventNotificationIsOn = alarmWrapper.eventNotificationState.getValue();
  }

  /**
   * Set off the notification is active OR viceversa
   */
  changeEventNotificationState() {
    this.eventNotificationIsOn = !this.eventNotificationIsOn;
    this.alarmWrapper.eventNotificationState.next(this.eventNotificationIsOn);
  }

  /**
   * Open overlay for display detail of the active notification
   */
  showPanel(event: MouseEvent){
    this.logger.info("Notification overlay opening");
    if (this.notificationPanel) this.notificationPanel.close();
    this.notificationPanel = this.overlay.open(NotificationDialogComponent, {
      attachTarget: event.target,
      hideBackdrop: true,
    }).dialogRef;
  }

  /**
   * Get text for tooltip based on notification active or not
   */
  get tooltipStatus(){
    return this.eventNotificationIsOn ? $localize`:@@HYT_notification_active:Notification ACTIVE` : $localize`:@@HYT_notification_inactive:Notification INACTIVE`;
  }

  /**
   * Display the number of notification active if the notificationIsOn
   */
  get notificationCount(){
    return this.alarmWrapper.alarmListArray.length;
  }
}
