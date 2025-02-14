import { Component } from '@angular/core';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { DialogRef, OverlayService } from 'components';
import { UserSiteSettingSelectors, Logger, LoggerService, DataExportNotificationSelectors } from 'core';
import { DataExportNotificationDialogComponent } from '../../dialogs/data-export-notification-notification-dialog/data-export-notification-dialog.component';

@Component({
  selector: 'hyt-data-export-notification-button',
  templateUrl: './data-export-notification-button.component.html',
  styleUrls: ['./data-export-notification-button.component.scss']
})
export class DataExportNotificationButtonComponent {
  /** Notification active get from alarmWrapperService */
  eventNotificationIsOn$ = this.store.select(UserSiteSettingSelectors.selectNotificationActive);
  /** Overlay object valorized only when panel is open */
  notificationPanel: DialogRef<any>;
  /** HYOT logger */
  private logger: Logger;

  notificationCount$ = this.store.select(DataExportNotificationSelectors.selectNotificationTotal);
  notificationCountLabel$ = this.notificationCount$.pipe(map(count => count > 99 ? "99+" : count));

  tooltipStatus = (eventNotificationIsOn: boolean) => eventNotificationIsOn ? $localize`:@@HYT_notification_active:Notification ACTIVE` : $localize`:@@HYT_notification_inactive:Notification INACTIVE`;

  constructor(
    private overlay: OverlayService,
    private store: Store,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass(this.constructor.name);
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
      this.notificationPanel = this.overlay.open(DataExportNotificationDialogComponent, {
        attachTarget: event.target,
        hideBackdrop: true,
        maxHeight: '520px',
        width: "350px",
      }).dialogRef
      this.notificationPanel.afterClosed().subscribe(()=>{
        this.notificationPanel = null;
      });
    }
  }

}
