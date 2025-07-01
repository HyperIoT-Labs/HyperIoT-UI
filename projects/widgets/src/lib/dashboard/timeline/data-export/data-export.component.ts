import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA, SelectOptionGroup, HytSelectComponent } from 'components';
import { DataExport } from '../models/data-export,model';
import { Store } from '@ngrx/store';
import {
  DataExportNotificationActions,
  DataExportNotificationStore,
  HDeviceSelectors,
  HPacket,
  HPacketSelectors,
  HProject,
  HProjectSelectors,
  HProjectService,
  Logger,
  LoggerService,
  NotificationManagerService
} from 'core';
import { BehaviorSubject, catchError, combineLatest, concatMap, filter, forkJoin, interval, map, Observable, of, Subject, Subscription, switchMap, take, takeWhile, tap, throwError } from 'rxjs';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter, NgxMatDatetimePicker, } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, NGX_MAT_MOMENT_FORMATS } from '@angular-material-components/moment-adapter';
import moment, { Moment } from 'moment';
import { HttpClient } from '@angular/common/http';
import saveAs from 'file-saver';

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
  selector: 'hyperiot-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: NGX_MAT_MOMENT_FORMATS },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
})
export class DataExportComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly maxLength = 255;

  maxValuesSubscription$: Subscription;
  maxValue$ = new BehaviorSubject<Moment>(moment());

  exportErrorList: { hPacketId: number, exportId: string }[] = [];

  exportInProgress = false;

  form = this.fb.group({
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    exportName: [
      null, [
        Validators.required,
        Validators.maxLength(this.maxLength),
        this.exportNameValidator
      ]
    ],
    hPacketFormat: [null, Validators.required],
  });

  @ViewChild('selectPackets') selectPackets: HytSelectComponent;

  @ViewChild('startTimePicker') startTimePicker: NgxMatDatetimePicker<any>;
  @ViewChild('endTimePicker') endTimePicker: NgxMatDatetimePicker<any>;

  readonly hPacketFormatEnum = HPacket.FormatEnum;

  get startTime(): FormControl {
    return this.form.controls.startTime as FormControl;
  }

  private get endTime(): FormControl {
    return this.form.controls.endTime as FormControl;
  }

  private get hPacketFormat(): FormControl {
    return this.form.controls.hPacketFormat as FormControl;
  }

  get exportName(): FormControl {
    return this.form.controls.exportName as FormControl;
  }

  private initialFormValue = {
    startTime: undefined,
    endTime: undefined,
    exportName: undefined,
    hPacketFormat: undefined,
    hPacket: undefined
  };

  hPacketListSelectOption: SelectOptionGroup[] = [];

  hPacketList: HPacket[] = [];
  hPacketListSelected: HPacket[] = [];

  private hProject: HProject;

  private logger: Logger;

  private data: DataExport | DataExportNotificationStore.DataExportNotification;

  readonly selectPacketsLabel = $localize`:@@HYT_select_packets:Select one or more Packets`;
  readonly countSelectedPackets = (hPacketCount: number) => $localize`:@@HYT_count_packets_selected:Selected ${hPacketCount} packets`;
  readonly exportDownloadError = (hPacketId: number) => $localize`:@@HYT_export_download_error:An error occurred while downloading the packet ${hPacketId}`;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    public dialogRef: DialogRef<any>,
    private hProjectsService: HProjectService,
    private httpClient: HttpClient,
    private notificationManagerService: NotificationManagerService,
    @Inject(DIALOG_DATA) data: DataExport | DataExportNotificationStore.DataExportNotification,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass(this.constructor.name);

    this.data = Object.freeze(data);
  }

  ngOnInit(): void {
    this.startTime.statusChanges
      .subscribe((status) => {
        if (status === 'VALID') {
          if (this.endTime.disabled) {
            this.endTime.enable();
          }
        } else {
          this.endTime.disable();
        }
      });

    this.startTime.valueChanges
      .subscribe((value) => {
        if (value > this.endTime.value) {
          this.endTime.reset();
        }
      });

    this.store.select(HProjectSelectors.selectCurrentHProject)
      .pipe(
        tap((hProject) => this.hProject = hProject),
        switchMap((hProject) => combineLatest({
          hDeviceList: this.store.select(HDeviceSelectors.selectAllHDevices)
            .pipe(
              map((res) => res.filter(({ project }) => project.id === hProject.id)),
            ),
          hPacketList: this.store.select(HPacketSelectors.selectAllHPackets)
        })),
        take(1)
      ).subscribe({
        next: ({ hDeviceList, hPacketList }) => {
          this.hPacketList = hPacketList;

          this.hPacketListSelectOption = hDeviceList.map((device) => ({
            name: device.deviceName,
            icon: 'icon-hyt_device',
            options: hPacketList
              .filter((hPacket) => hPacket.device.id === device.id)
              .map((hPacket) => ({
                value: hPacket,
                label: hPacket.name,
                icon: 'icon-hyt_packets',
              })),
          }));
        },
        error: (err) => {
          console.error(err);
        }
      });

    const data = this.data;
    if ('timeInterval' in data) {
      const { timeInterval } = data;

      this.initialFormValue = {
        ...this.initialFormValue,
        startTime: timeInterval[0],
        endTime: timeInterval[1],
      };

      this.form.patchValue({
        ...this.initialFormValue,
      });
    } else if ('exportParams' in data) {
      const {
        exportParams: {
          startTime,
          endTime,
          exportName,
          hPacketFormat,
          hPacket
        }
      } = data;

      this.initialFormValue = {
        startTime: moment(startTime).toDate(),
        endTime: moment(endTime).toDate(),
        exportName,
        hPacketFormat,
        hPacket
      };

      this.addPacketSelectedList(hPacket);

      this.form.patchValue({ ...this.initialFormValue });
    }
  }

  ngAfterViewInit(): void {
    this.maxValuesSubscription$ = interval(100)
      .pipe(
        filter(() => this.startTimePicker.opened || this.endTimePicker.opened),
        tap(() => this.maxValue$.next(moment())),
        tap(() => {
          const timeContainer: HTMLDivElement = document.querySelector('ngx-mat-datetime-content > div.time-container');
          if (timeContainer) {
            const errorDateContainer = document.getElementById('errorDateContainer')
            const setDateButton: HTMLButtonElement = document.querySelector("ngx-mat-datetime-content > div.actions > button");
            if (!this.startTimePicker.valid || !this.endTimePicker.valid) {
              if (!errorDateContainer) {
                const errorLabel: HTMLLabelElement = document.createElement('label');
                errorLabel.id = 'errorLabel';
                errorLabel.style.fontSize = '14px';
                errorLabel.textContent = 'Error: The specified date is not applicable.';

                const errorDateContainer: HTMLDivElement = document.createElement('div');
                errorDateContainer.id = 'errorDateContainer';
                errorDateContainer.style.display = 'block';
                errorDateContainer.style.color = 'red';
                errorDateContainer.append(errorLabel);

                timeContainer.appendChild(errorDateContainer);
                timeContainer.style.flexDirection = 'column';
                timeContainer.style.alignItems = 'center';

                setDateButton.disabled = true;
                setDateButton.classList.add('mat-button-disabled');
              }
            } else {
              if (errorDateContainer) {
                errorDateContainer.remove();
              }

              if (setDateButton) {
                setDateButton.disabled = false;
                setDateButton.classList.remove('mat-button-disabled');
              }
            }
          }
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.maxValuesSubscription$.unsubscribe();
    this.maxValue$.unsubscribe();
  }


  private exportNameValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === null) {
      return;
    }

    const exportName: string = control.value;
    const notAllowedChars = /[?!.]|[;<>=&`'"()]|(--)|(\*|\/)/;

    if (exportName && (exportName.includes(' ') || notAllowedChars.test(exportName))) {
      return { charNotAllowed: true };
    }

    return null;
  }

  export() {
    this.exportInProgress = true;
    this.form.disable();

    this.exportErrorList = [];

    const hProject = this.hProject;
    const hProjectId = hProject.id;
    const exportName: string = this.exportName.value;

    const startTime = this.startTime.value;
    const startTimeInMills = moment(startTime).valueOf(); //moment unix timestamp in milliseconds

    const endTime = this.endTime.value;
    const endTimeInMills = moment(endTime).valueOf(); //moment unix timestamp in milliseconds

    const hPacketFormat = this.hPacketFormat.value as HPacket.FormatEnum;

    const exportFormat = new Map<HPacket.FormatEnum, string>([
      [HPacket.FormatEnum.CSV, '.csv'],
      [HPacket.FormatEnum.JSON, '.json'],
      [HPacket.FormatEnum.TEXT, '.txt'],
      [HPacket.FormatEnum.XML, '.xml'],
    ]);

    for (let index = 0; index < this.hPacketListSelected.length; index++) {
      const hPacket = this.hPacketListSelected[index];

      const hPacketId = hPacket.id;

      const fullFileName = this.hPacketListSelected.length > 1
        ? `${exportName}-${index}${exportFormat.get(hPacketFormat)}`
        : `${exportName}${exportFormat.get(hPacketFormat)}`;

      this.hProjectsService.exportHPacketData(
        hProjectId,
        hPacketId,
        hPacketFormat,
        exportName,
        startTimeInMills,
        endTimeInMills
      ).pipe(
        switchMap(({ exportId }: ExportHPacketData) =>
          interval(500)
            .pipe(
              switchMap(() => this.hProjectsService.getExportStatus(exportId)
                .pipe(
                  catchError((error) => {
                    this.logger.error('getExportStatus:', error);
                    return throwError(() => error);
                  }),
                )),
              takeWhile(({ completed, hasErrors }: ExportHPacketData) => !(completed || hasErrors), true),
            )
        ),
        concatMap((status: ExportHPacketData) => {
          if (status.completed) {
            return forkJoin({
              blob: this.httpClient.get(
                `/hyperiot/hprojects/export/download/${encodeURIComponent(status.exportId)}`,
                {
                  responseType: 'blob'
                }
              ),
              status: of(status)
            });
          } else if (status.hasErrors) {
            return throwError(() => status);
          } else {
            return of(status);
          }
        })
      ).subscribe({
        next: (exportData: ExportHPacketData | { blob: Blob; status: ExportHPacketData; }) => {
          const { processedRecords, totalRecords, exportId, started, hasErrors, errorMessages } = 'blob' in exportData
            ? exportData.status
            : exportData;

          if (started) {
            if (hasErrors) {
              this.exportErrorList.push({ hPacketId, exportId });
              this.logger.error('Error:', errorMessages);
              this.exportErrorList.push({ hPacketId, exportId });
              this.logger.error('Error:', errorMessages);
            } else {
              const progress = this.percentageRecordsProcessed(processedRecords, totalRecords);

              const notification: DataExportNotificationStore.DataExportNotification = {
                exportParams: {
                  exportId,
                  hProject,
                  hPacket,
                  hPacketFormat,
                  exportName,
                  startTime,
                  endTime
                },
                exportInfo: {
                  fullFileName,
                  progress,
                  downloadDate: progress < 100 ? undefined : new Date()
                }
              };

              this.store.dispatch(DataExportNotificationActions.addOrUpdateNotification({ notification }));

              if ('blob' in exportData) {
                try {
                  saveAs(exportData.blob, fullFileName);
                  this.dialogRef.close();
                } catch (error) {
                  this.exportInProgress = false;
                  this.form.enable();
                  this.exportErrorList.push({ hPacketId, exportId });
                  this.logger.error('Export download error', error);
                }
              }
            }
          }
        },
        error: (err) => {
          this.exportInProgress = false;
          this.form.enable();
          this.exportErrorList.push({ hPacketId, exportId: null });
          this.logger.error('Export error', err);
        }
      });
    }
  }

  private percentageRecordsProcessed(processedRecords: number, totalRecords: number) {
    return processedRecords >= totalRecords
      ? 100
      : Math.round((processedRecords / totalRecords) * 100);
  }

  addPacketSelectedList(hPacket: HPacket) {
    this.clearSelectPackets();

    if (!this.hPacketListSelected.some((item) => item.id === hPacket.id)) {
      this.hPacketListSelected.push(hPacket);
    }
  }

  resetForm() {
    this.hPacketListSelected = [];

    this.clearSelectPackets();

    if ('exportParams' in this.data) {
      this.addPacketSelectedList(this.initialFormValue.hPacket);
    }

    this.form.reset({ ...this.initialFormValue });

    this.exportErrorList = [];
  }

  private clearSelectPackets() {
    if (this.selectPackets) {
      const { formControl } = this.selectPackets;
      formControl.reset();
      formControl.markAsUntouched();
      formControl.setErrors(null);
    }
  }

  removeHPacket({ id }: HPacket): void {
    const index = this.hPacketListSelected.findIndex((hPacket) => hPacket.id === id);

    if (index >= 0) {
      this.hPacketListSelected.splice(index, 1);
    }
  }

}
