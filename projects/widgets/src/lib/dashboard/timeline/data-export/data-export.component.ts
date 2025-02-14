import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from 'components';
import { DataExport } from '../models/data-export,model';
import { Store } from '@ngrx/store';
import { HDeviceSelectors, HPacket, HPacketSelectors, HProjectSelectors, HprojectsService } from 'core';
import { map, switchMap, tap } from 'rxjs';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter, } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, NGX_MAT_MOMENT_FORMATS } from '@angular-material-components/moment-adapter';
import moment from 'moment';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
export class DataExportComponent implements OnInit {

  readonly maxLength = 255;

  exportErrorList: { hPacketId: number }[] = [];

  form = this.fb.group({
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    exportName: [null, [Validators.required, Validators.maxLength(this.maxLength)]],
    hPacketFormat: [null, Validators.required],
  });

  readonly hPacketFormatEnum = HPacket.FormatEnum;

  private get startTime(): FormControl {
    return this.form.controls.startTime as FormControl;
  }

  private get endTime(): FormControl {
    return this.form.get('endTime') as FormControl;
  }

  private get hPacketFormat(): FormControl {
    return this.form.controls.hPacketFormat as FormControl;
  }

  private get exportName(): FormControl {
    return this.form.controls.exportName as FormControl;
  }

  private initialFormValue: Record<'startTime' | 'endTime', Date> = {
    startTime: undefined,
    endTime: undefined,
  };

  readonly initialPacketList: HPacket[] = [];

  hPacketList: HPacket[] = [];

  hPacketListSelected: HPacket[] = [];

  private hProjectId: number;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: DataExport,
    private hProjectsService: HprojectsService,
    private httpClient: HttpClient,
  ) {
    this.store.select(HProjectSelectors.selectCurrentHProjectId)
      .pipe(
        tap((hProjectId) => this.hProjectId = hProjectId),
        switchMap((hProjectId) =>
          this.store.select(HDeviceSelectors.selectAllHDevices)
            .pipe(
              map((hDeviceList) => hDeviceList.filter(({ project }) => project.id === hProjectId))
            )
        ),
        switchMap((hDeviceList) =>
          this.store.select(HPacketSelectors.selectAllHPackets)
            .pipe(
              tap((hPacketList) => this.initialPacketList.push(...hPacketList)),
              map((hPacketList) => {
                const deviceIdList = hDeviceList.map(({ id }) => id);
                return hPacketList.filter(({ device }) => deviceIdList.includes(device.id));
              })
            ))
      ).subscribe({
        next: (hPacketList) => {
          this.hPacketList = hPacketList;
        }
      })
  }

  ngOnInit(): void {
    const { timeInterval, domain } = this.data;

    let interval: Date[] = [];
    if (timeInterval.length) {
      interval = timeInterval;
    } else if (domain.length) {
      interval = domain;
    }

    if (interval.length) {
      this.initialFormValue = {
        startTime: interval[0],
        endTime: interval[1],
      };

      this.form.patchValue({ ...this.initialFormValue });
    }
  }

  moveElementToLeft(element: HPacket) {
    this.hPacketList = this.hPacketList.filter(({ name }) => name !== element.name);
    this.hPacketListSelected.push(element);
  }

  moveElementToRight(element: HPacket) {
    this.hPacketListSelected = this.hPacketListSelected.filter(({ name }) => name !== element.name);
    this.hPacketList.push(element);
  }

  drop(event: CdkDragDrop<HPacket[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  closeModal(event?: any): void {
    this.dialogRef.close(event);
  }

  export() {
    this.exportErrorList = [];
    
    const hProjectId = this.hProjectId;
    const exportName = this.exportName.value;
    const hPacketFormat = this.hPacketFormat.value;
    const startTime = moment(this.startTime.value).valueOf(); //moment unix timestamp in milliseconds
    const endTime = moment(this.endTime.value).valueOf(); //moment unix timestamp in milliseconds

    for (const hPacket of this.hPacketListSelected) {
      const hPacketId = hPacket.id;

      this.hProjectsService
        .exportHPacketData(
          hProjectId,
          hPacket.id,
          hPacketFormat,
          exportName,
          startTime,
          endTime
        )
        .subscribe({
          next: (ret: ExportHPacketData) => {
            const interval = setInterval(() => {
              this.hProjectsService.getExportStatus(ret.exportId)
                .subscribe({
                  next: (status) => {
                    if (status.completed) {
                      clearInterval(interval);

                      this.httpClient.get(
                        `/hyperiot/hprojects/export/download/${encodeURIComponent(status.exportId)}`,
                        {
                          responseType: 'blob'
                        }
                      ).subscribe({
                        next: (res) => saveAs(res, `${exportName}.${hPacketFormat}`),
                        error: (err) => {
                          this.exportErrorList.push({ hPacketId });
                          console.error(err)
                        }
                      });
                    }
                  },
                });
            }, 1000);
          }
        });
    }

    // this.dialogRef.close('save');
  }

  resetForm() {
    this.hPacketList = [...this.initialPacketList];
    this.hPacketListSelected.length = 0;

    this.form.reset({ ...this.initialFormValue });

    this.exportErrorList = [];
  }
}
