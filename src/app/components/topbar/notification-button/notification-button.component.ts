import { Component } from '@angular/core';
import { DialogRef, OverlayService } from 'components';
import { LiveAlarmSelectors, Logger, LoggerService, UserSiteSettingSelectors } from 'core';
import { NotificationDialogComponent } from '../../dialogs/notification-dialog/notification-dialog.component';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

@Component({
  selector: 'hyt-notification-button',
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.scss'],
})
export class NotificationButtonComponent {
  /** Notification active get from alarmWrapperService */
  eventNotificationIsOn = this.store.select(UserSiteSettingSelectors.selectNotificationActive);
  /** Overlay object valorized only when panel is open */
  notificationPanel: DialogRef<any>;
  /** HYOT logger */
  private logger: Logger;

  notificationCount$ = this.store.select(LiveAlarmSelectors.selectLiveAlarmTotal);
  notificationCountLabel$ = this.notificationCount$.pipe(map(count => count > 99 ? "99+" : count));

  tooltipStatus = (eventNotificationIsOn: boolean) => eventNotificationIsOn ? $localize`:@@HYT_notification_active:Notification ACTIVE` : $localize`:@@HYT_notification_inactive:Notification INACTIVE`;
  
  constructor(
    private overlay: OverlayService,
    private store: Store,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("NotificationButtonComponent");
  }

  /**
   * Open overlay for display detail of the active notification
   */
  showPanel(event: MouseEvent){
    this.logger.info("Notification overlay opening");
    if (this.notificationPanel) {
      // if already open, i close it
      this.notificationPanel.close();
    }else{
      // open notification panel
      this.notificationPanel = this.overlay.open(NotificationDialogComponent, {
        attachTarget: event.target,
        hideBackdrop: true,
        maxHeight: '480px',
        width: "350px",
      }).dialogRef
      this.notificationPanel.afterClosed().subscribe(()=>{
        this.notificationPanel = null;
      });
    }
  }

}