import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogRef } from 'components';
import { DataExportNotificationActions, DataExportNotificationSelectors, DataExportNotificationStore, HPacket, HprojectsService, Logger, LoggerService } from 'core';
import saveAs from 'file-saver';
import { catchError, concatMap, interval, forkJoin, of, switchMap, takeWhile } from 'rxjs';

type ExportHPacketData = {
  processedRecords: number;
  totalRecords: number;
  exportId: string;
  started: boolean;
  completed: boolean;
  fileName: string;
  errorMessages: any[];
  hasErrors: boolean;
};

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
export class DataExportNotificationDialogComponent implements OnInit {
  /** HYOT logger */
  private logger: Logger;

  readonly HPacketFormat = HPacket.FormatEnum;

  notificationList: DataExportNotificationStore.DataExportNotification[] = [];

  constructor(
    public dialogRef: DialogRef<any>,
    private store: Store,
    loggerService: LoggerService,
    private httpClient: HttpClient,
    private hProjectsService: HprojectsService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  ngOnInit(): void {
    this.store.select(DataExportNotificationSelectors.selectAllNotifications)
      .subscribe({
        next: (notificationList) => this.notificationList = notificationList
      });
  }

  retryDownload(notification: DataExportNotificationStore.DataExportNotification) {
    const {
      data: {
        exportParams,
        exportParams: {
          hPacketId,
          hProjectId,
          hPacketFormat,
          exportName,
          startTime,
          endTime,
          exportId: oldExportId
        },
        download
      }
    } = notification;

    let isFirst = true;

    this.hProjectsService.exportHPacketData(
      hProjectId,
      hPacketId,
      hPacketFormat,
      exportName,
      startTime,
      endTime
    ).pipe(
      switchMap(({ exportId: retryExportId }: ExportHPacketData) =>
        interval(500)
          .pipe(
            switchMap(() => this.hProjectsService.getExportStatus(retryExportId)),
            takeWhile((status: ExportHPacketData) => !(status.completed || status.hasErrors), true),
            catchError((error) => {
              this.logger.error('Error:', error);
              return of({ hasErrors: true });
            })
          ),
      ),
      concatMap((status: ExportHPacketData) => {
        const {
          exportId: retryExportId,
          completed
        } = status;

        if (completed) {
          return forkJoin({
            blob: this.httpClient.get(
              `/hyperiot/hprojects/export/download/${encodeURIComponent(retryExportId)}`,
              {
                responseType: 'blob'
              }
            ),
            status: of(status)
          })
        } else {
          return of(status);
        }
      })
    ).subscribe({
      next: (exportData: ExportHPacketData | { blob: Blob; status: ExportHPacketData; }) => {
        const { processedRecords, totalRecords, exportId } =
          'blob' in exportData
            ? exportData.status
            : exportData;

        const progress = this.percentageRecordsProcessed(processedRecords, totalRecords);

        const retryData: DataExportNotificationStore.DataExportNotification['data'] = {
          exportParams: {
            ...exportParams,
            exportId
          },
          download: {
            ...download,
            progress,
            lastDownload: progress < 100 ? undefined : new Date()
          },
        };

        this.store.dispatch(
          DataExportNotificationActions.updateNotification({
            update: {
              id: isFirst ? oldExportId : exportId,
              changes: {
                data: retryData
              }
            }
          })
        );

        isFirst = false;

        if ('blob' in exportData) {
          try {
            saveAs(exportData.blob, download.fullFileName);
          } catch (error) {
            this.logger.error('Download Error');
          }
        } else {
          if (exportData.hasErrors) {
            this.logger.error('Error:', exportData.errorMessages);
          } else {
            this.logger.debug('Value:', exportData);
          }
        }
      },
      error: (err) => {
        this.logger.error(err);
      }
    });
  }

  private percentageRecordsProcessed(processedRecords: number, totalRecords: number) {
    return processedRecords >= totalRecords
      ? 100
      : Math.round((processedRecords / totalRecords) * 100);
  }

}
