import { Component, OnInit } from '@angular/core';
import { DialogRef, OverlayService } from 'components';
import { AlarmWrapperService, Logger, LoggerService } from 'core';
import { NotificationDialogComponent } from '../../dialogs/notification-dialog/notification-dialog.component';

@Component({
  selector: 'hyt-notification-button',
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.scss'],
})
export class NotificationButtonComponent implements OnInit{
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
  }
  
  ngOnInit(): void {
    this.eventNotificationIsOn = this.alarmWrapper.eventNotificationState.getValue();
    this.alarmWrapper.eventNotificationState.subscribe((res)=> this.eventNotificationIsOn = res);
  }

  /**
   * Open overlay for display detail of the active notification
   */
  showPanel(event: MouseEvent){
    this.logger.info("Notification overlay opening");
    if (this.notificationPanel) {
      // if already open, i close it
      this.notificationPanel.close();
      this.notificationPanel = null;
    }else{
      // open notification panel
      this.notificationPanel = this.overlay.open(NotificationDialogComponent, {
        attachTarget: event.target,
        hideBackdrop: true,
      }).dialogRef;
    }
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

  /**
   * Display the number of notification active if the notificationIsOn, if higher than 99, it shows 99+
   */
  get notificationCountLabel(){
    const count = this.notificationCount;
    return count > 99 ? "99+" : count;
  }
}
