import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from 'components';
import { DataExport } from '../models/data-export,model';
import { Store } from '@ngrx/store';
import { HDeviceSelectors, HPacket, HPacketSelectors, HProjectSelectors, HprojectsService } from 'core';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import moment from 'moment';
import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

type Vegetable = {
  name: string
}

@Component({
  selector: 'hyperiot-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
  ],
})
export class DataExportComponent implements OnInit {

  readonly maxLength = 255;

  form = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    exportName: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
    hPacketFormat: ['', Validators.required],
    hPacketId: ['', Validators.required]
  });

  readonly hPacketFormatEnum = HPacket.FormatEnum;

  private get startTime(): FormControl {
    return this.form.controls.startTime as FormControl;
  }

  private get endTime(): FormControl {
    return this.form.controls.endTime as FormControl;
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

  private hDeviceList$ =
    this.store.select(HProjectSelectors.selectCurrentHProjectId)
      .pipe(
        tap((hProjectId) => this.hProjectId = hProjectId),
        switchMap((hProjectId) =>
          this.store.select(HDeviceSelectors.selectAllHDevices)
            .pipe(
              map((hDeviceList) => hDeviceList.filter(({ project }) => project.id === hProjectId))
            )
        )
      );

  hPacketList$ = this.hDeviceList$
    .pipe(
      switchMap((hDeviceList) => this.store.select(HPacketSelectors.selectAllHPackets)
        .pipe(
          map((hPacketList) => {
            const deviceIdList = hDeviceList.map(({ id }) => id);
            return hPacketList.find(({ device }) => deviceIdList.includes(device.id));
          })
        ))
    );

  vegetables1: Vegetable[] = [
    { name: 'apple' },
    { name: 'banana' },
    { name: 'strawberry' },
    { name: 'orange' },
    { name: 'kiwi' },
    { name: 'cherry' },
  ];

  vegetables2: Vegetable[] = [
  ];

  private hProjectId: number;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: DataExport,
    private hProjectsService: HprojectsService
  ) {

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

  moveElementToLeft(element: Vegetable) {
    this.vegetables1 = this.vegetables1.filter(({ name }) => name !== element.name);
    this.vegetables2.push(element);
  }

  moveElementToRight(element: Vegetable) {
    this.vegetables2 = this.vegetables2.filter(({ name }) => name !== element.name);
    this.vegetables1.push(element);
  }

  drop(event: CdkDragDrop<Vegetable[]>) {
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
    const hPacketId = 8457;

    this.hProjectsService
      .exportHPacketData(
        this.hProjectId,
        hPacketId,
        this.hPacketFormat.value,
        this.exportName.value,
        moment(this.startTime.value).valueOf(), //moment unix timestamp in milliseconds
        moment(this.endTime.value).valueOf(),

        // 6399,
        // 6438,
        // 'csv',
        // '',
        // 1733007600000,
        // 1735599600000
      )
      .subscribe({
        next: (ret: ExportHPacketData) => {
          console.log(ret);

          const interval = setInterval(() => {
            this.hProjectsService.getExportStatus(ret.exportId)
              .subscribe({
                next: (rStatus) => {
                  console.log('status', rStatus);

                  if (rStatus.completed) {
                    clearInterval(interval);

                    this.hProjectsService
                      .downloadHPacketDataExport(rStatus.exportId)
                      .subscribe({
                        next: (r) => {
                          console.log('download', r);
                        },
                      });
                  }
                },
              });

          }, 1000);
        },
      });

    this.dialogRef.close('save');
  }

  resetForm() {
    this.form.reset({ ...this.initialFormValue });
  }
}
