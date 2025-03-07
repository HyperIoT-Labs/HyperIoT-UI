import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogRef, DialogService } from 'components';
import { DataExportNotificationSelectors, DataExportNotificationStore, HPacket, Logger, LoggerService } from 'core';
import { DataExportComponent } from 'widgets';

@Component({
  selector: 'hyt-data-export-notification-dialog',
  templateUrl: './data-export-notification-dialog.component.html',
  styleUrls: ['./data-export-notification-dialog.component.scss'],
  animations: [
    trigger('containerAnim', [
      transition('* => *', [
        group([
          query(':enter:not(#no-notification)', [
            style({ height: 0, opacity: 0, 'overflow-y': 'hidden' }),
            animate('200ms ease-out', style({ height: '*', opacity: 1 })),
            style({ 'overflow-y': 'auto' }),
          ], { optional: true }),
          query(':leave:not(#no-notification)', [
            animate('200ms ease-out', style({ opacity: 0, transform: 'translateX(-300px)', 'overflow-y': 'hidden' })),
            animate('200ms', style({ height: 0, padding: 0 })),
            style({ 'overflow-y': 'auto' }),
          ], { optional: true }),
          query('#no-notification:enter', [
            style({ opacity: 0, 'margin-top': '-223px' }),
            animate('200ms', style({ opacity: 0, 'margin-top': '-223px' })),
            animate('200ms', style({ opacity: 1, 'margin-top': '0' })),
          ], { optional: true }),
          query('#no-notification:leave', [
            style({ opacity: 1, 'margin-top': '0' }),
            animate('400ms', style({ opacity: 0, 'margin-top': '-223px' })),
          ], { optional: true }),
        ])
      ]),
    ]),
  ],
})
export class DataExportNotificationDialogComponent {
  /** HYOT logger */
  private logger: Logger;

  readonly dateFormat = 'DD/MM/YYYY HH:mm:ss.SSS';

  readonly HPacketFormat = HPacket.FormatEnum;

  readonly notificationList$ = this.store.select(DataExportNotificationSelectors.selectAllNotifications);

  constructor(
    public dialogRef: DialogRef<any>,
    private store: Store,
    loggerService: LoggerService,
    private dialogService: DialogService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  retryDownloadOpenEditor(notification: DataExportNotificationStore.DataExportNotification) {
    this.dialogService.open<DataExportComponent, DataExportNotificationStore.DataExportNotification>(
      DataExportComponent,
      {
        data: notification,
        height: '600px',
        width: '600px',
        backgroundClosable: true,
      }
    );
  }

}
