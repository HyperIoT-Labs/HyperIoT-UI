import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogRef } from 'components';
import { DataExportNotificationSelectors, DataExportNotificationStore, HPacket, HprojectsService, Logger, LoggerService, UserSiteSettingActions, UserSiteSettingSelectors } from 'core';
import saveAs from 'file-saver';
import { catchError, concatMap, EMPTY, filter, interval, map, of, switchMap, takeWhile, tap, exhaustMap} from 'rxjs';

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
export class DataExportNotificationDialogComponent {
  /** Notification active get from alarmWrapperService */
  readonly eventNotificationIsOn = this.store.select(UserSiteSettingSelectors.selectNotificationActive);

  /** HYOT logger */
  private logger: Logger;

  readonly HPacketFormat = HPacket.FormatEnum;

  readonly notificationList$ = this.store.select(DataExportNotificationSelectors.selectAllNotifications);

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

  retryDownload({
    data: { hProjectId, hPacketId, hPacketFormat, exportName, startTime, endTime, fullFileName }
  }: DataExportNotificationStore.DataExportNotification) {

    // this.hProjectsService.exportHPacketData(
    //   hProjectId,
    //   hPacketId,
    //   hPacketFormat,
    //   exportName,
    //   startTime,
    //   endTime
    // ).pipe(
    //   switchMap(({ exportId }: ExportHPacketData) =>
    //     interval(1000).pipe(
    //       switchMap(() => this.hProjectsService.getExportStatus(exportId)),
    //       tap((status: ExportHPacketData) => console.log('Stato di creazione del file:', status)),
    //       takeWhile(({ completed, hasErrors }) => !completed),
    //       switchMap((status: ExportHPacketData) => {
    //         if (status.completed) {
    //           // Se la creazione del file è completata, avvia il download
    //           return this.httpClient.get(
    //             `/hyperiot/hprojects/export/download/${encodeURIComponent(status.exportId)}`,
    //             {
    //               responseType: 'blob'
    //             }
    //           )
    //         } else {
    //           console.error(`ERRORE`);
    //           // Se la creazione del file non è completata, ritorna un osservabile vuoto
    //           return of(null);
    //         }
    //       }),
    //       tap((file) => {
    //         if (file) {
    //           console.log(`Download del file avviato: ${file}`);
    //           // Eseguire il download del file
    //         }
    //       })
    //     ))
    // ).subscribe({
    //   next: (file) => {
    //     this.logger.debug('TEST')
    //     saveAs(file, fullFileName)
    //   }
    // })



    this.hProjectsService.exportHPacketData(
      hProjectId,
      hPacketId,
      hPacketFormat,
      exportName,
      startTime,
      endTime
    ).pipe(
      switchMap(({ exportId }: ExportHPacketData) =>
        interval(500)
          .pipe(
            switchMap(() => this.hProjectsService.getExportStatus(exportId)),
            takeWhile((status: ExportHPacketData) => !status.completed, true),
          ),
      ),
      concatMap((res: ExportHPacketData) => {
        if (res.completed) {
          return this.httpClient.get(
            `/hyperiot/hprojects/export/download/${encodeURIComponent(res.exportId)}`,
            {
              responseType: 'blob'
            }
          )
        } else {
          return of(res);
        }
      })
    ).subscribe({
      next: (res) => {
        if (res instanceof Blob) {
          saveAs(res, fullFileName)
        } else {
          if (res.hasErrors) {
            this.logger.error('Errore:', res.errorMessages);
          } else {
            this.logger.debug('Value:', res);
          }
        }
      },
      error: (err) => {
        this.logger.error(err);
      }
    });
  }

  downloadPercentage() {

  }

}
