import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from 'components';
import { DataExport } from '../models/data-export,model';
import { Store } from '@ngrx/store';
import { HDeviceSelectors, HPacket, HProjectSelectors, HprojectsService } from 'core';
import { map } from 'rxjs';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import moment from 'moment';

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
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
  ],
})
export class DataExportComponent implements OnInit {

  maxLength = 255;
  
  form = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    exportName: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
    hPacketFormat: ['', Validators.required]
  });

  hPacketFormatEnum = HPacket.FormatEnum;

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

  devices = this.store.select(HDeviceSelectors.selectAllHDevices).pipe(
    map((devices) =>
      devices.filter(({ project }) => {
        //TODO
        const selectedProjectId = 8451;
        return project.id === selectedProjectId;
      })
    )
  );

  private hProjectId: number;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: DataExport,
    private hProjectsService: HprojectsService
  ) {
    this.store
      .select(HProjectSelectors.selectCurrentHProjectId)
      .subscribe({
        next: (id) => this.hProjectId = id
      });
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
        moment(this.startTime.value).unix(),
        moment(this.endTime.value).unix()
      )
      .subscribe({
        next: (ret: ExportHPacketData) => {
          console.log(ret);

          const interval = setInterval(() => {
            if (ret.completed) {
              clearInterval(interval);
            }

            this.hProjectsService.getExportStatus(ret.exportId)
              .subscribe({
                next: (r) => {
                  console.log('status', r);
                },
              });

            this.hProjectsService
              .downloadHPacketDataExport(ret.exportId)
              .subscribe({
                next: (r) => {
                  console.log('download', r);
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
