import { Component, Inject, Injectable, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from 'components';
import { DataExport } from '../models/data-export,model';
import { Store } from '@ngrx/store';
import { HDevice, HDeviceSelectors, HPacketSelectors, HProjectSelectors, HProjectStore, HprojectsService } from 'core';
import { map, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, ThemePalette } from '@angular/material/core';
import { NGX_MAT_DATE_FORMATS, NgxMatDateAdapter, NgxMatDateFormats } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, NgxMatMomentDateAdapterOptions, } from '@angular-material-components/moment-adapter';
import moment from 'moment';
import 'moment/locale/it'

type ExportHPacketData = {
  processedRecords: number,
  totalRecords: number,
  exportId: string,
  started: boolean,
  completed: boolean,
  fileName: string,
  errorMessages: any[],
  hasErrors: boolean
}

// const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
//   parse: {
//     dateInput: "l, LTS"
//   },
//   display: {
//     dateInput: "l, LTS",
//     monthYearLabel: "MMM YYYY",
//     dateA11yLabel: "LL",
//     monthYearA11yLabel: "MMMM YYYY"
//   }
// };

// export const CUSTOM_DATE_FORMAT: NgxMatDateFormats = {
//   parse: {
//     dateInput: 'DD/MM/YYYY',
//   },
//   display: {
//     dateInput: 'DD/MM/YYYY',
//     monthYearLabel: 'MMMM YYYY',
//     dateA11yLabel: 'DD/MM/YYYY',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

// const MY_NGX_DATE_FORMATS: NgxMatDateFormats = {
//   parse: {
//     dateInput: "l, LTS"
//   },
//   display: {
//     dateInput: MOMENT_DATETIME_WITH_SECONDS_FORMAT,
//     monthYearLabel: "MMM YYYY",
//     dateA11yLabel: "LL",
//     monthYearA11yLabel: "MMMM YYYY"
//   }
// };

export const CUSTOM_DATE_FORMAT: NgxMatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'hyperiot-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
  providers: [
    // {provide: MAT_DATE_LOCALE, useValue: 'it-IT'},
    // {provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}},
    {
      provide: NgxMatDateAdapter,
      useClass: NgxMatMomentAdapter,
      deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT }


    // { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    // { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT },
    // { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
    // {
    //   provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS,
    //   useValue: { useUtc: true } as NgxMatMomentDateAdapterOptions
    // },
  ]
})
export class DataExportComponent implements OnInit {

  date: moment.Moment;
  // dateControl = this.fb.control(new Date(2021, 9, 4, 5, 6, 7));

  color: ThemePalette = 'primary';

  form = this.fb.group({
    startTime: '',
    endTime: '',
    // dateControl: ''
  });

  get startTime() {
    return this.form.controls.startTime;
  }

  get endTime() {
    return this.form.controls.endTime;
  }

  private initialFormValue: Record<'startTime' | 'endTime', Date> = {
    startTime: undefined,
    endTime: undefined
  }

  devices = this.store.select(HDeviceSelectors.selectAllHDevices)
    .pipe(
      map((devices) => devices.filter(({ project }) => {
        //TODO
        const selectedProjectId = 8451;
        return project.id === selectedProjectId
      })),
    )

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: DataExport,
    private hprojectsService: HprojectsService,
  ) {
    moment.locale('it');
    moment.localeData('it');
  }

  ngOnInit(): void {
    console.log(this.data);

    const { domain, timeInterval } = this.data;
    if (timeInterval.length) {
      this.initialFormValue = {
        startTime: timeInterval[0],
        endTime: timeInterval[1]
      };
    } else if (domain.length) {
      this.initialFormValue = {
        startTime: domain[0],
        endTime: domain[1]
      };
    }

    this.form.patchValue({ ...this.initialFormValue });
  }

  closeModal(event?: any): void {
    this.dialogRef.close(event);
  }

  export() {
    const hProjectId = 8451;
    const hPacketId = 8457;
    const hPacketFormat = 'JSON';
    const exportName = ''
    const rowKeyLowerBound = moment(this.startTime.value).unix();
    const rowKeyUpperBound = moment(this.endTime.value).unix();

    this.hprojectsService.exportHPacketData(
      hProjectId,
      hPacketId,
      hPacketFormat,
      exportName,
      rowKeyLowerBound,
      rowKeyUpperBound
    ).subscribe({
      next: (ret: ExportHPacketData) => {
        console.log(ret);

        const interval = setInterval(() => {
          if (ret.completed) {
            clearInterval(interval)
          }

          this.hprojectsService.getExportStatus(ret.exportId)
            .subscribe({
              next: (r) => {
                console.log('status', r);
              }
            });

          this.hprojectsService.downloadHPacketDataExport(ret.exportId)
            .subscribe({
              next: (r) => {
                console.log('download', r);
              }
            });
        }, 1000);

      }
    })


    this.dialogRef.close('save');
  }

  resetForm() {
    this.form.reset({ ...this.initialFormValue });
  }
}
