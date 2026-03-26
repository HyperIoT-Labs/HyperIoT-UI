import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from 'components';
import { CustomDefaultSelectionDialogConfig } from './custom-default-selection-dialog.model';
import { DefaultTimelineCustomRange } from '../model/dashboardTimelineDefaultRange';
import * as moment_ from 'moment';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, NGX_MAT_MOMENT_FORMATS, NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';

const moment = moment_;

export const timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startTime')?.value;
  const end = control.get('endTime')?.value;

  if (!start || !end) {
    return null;
  }

  return start < end ? null : { timeRangeInvalid: true };
};

@Component({
  selector: 'hyperiot-custom-default-selection-dialog',
  templateUrl: './custom-default-selection-dialog.component.html',
  styleUrls: ['./custom-default-selection-dialog.component.css'],
    providers: [
      { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
      { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_DATE_FORMATS, useValue: NGX_MAT_MOMENT_FORMATS },
      { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    ],
})
export class CustomDefaultSelectionDialogComponent implements OnInit {

  customRangeForm = this.fb.group({
    startTime: new FormControl(null, Validators.required),
    endTime: new FormControl(null, Validators.required),
    endTimeCurrentTime: new FormControl(false),
  }, { validators: timeRangeValidator });

  updateEndTimeCurrentTime;

  constructor(
    private dialogRef: DialogRef<DefaultTimelineCustomRange>,
    @Inject(DIALOG_DATA) public data: CustomDefaultSelectionDialogConfig,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.customRangeForm.controls.endTimeCurrentTime.valueChanges.subscribe(endTimeCurrentTime => {
      if (endTimeCurrentTime) {
        this.customRangeForm.controls.endTime.disable();
        this.customRangeForm.controls.endTime.clearValidators();
        this.updateEndTimeCurrentTime = setInterval(() => {
          this.customRangeForm.controls.endTime.patchValue(new Date());
        }, 1000);
        this.customRangeForm.controls.endTime.patchValue(new Date());
      } else {
        clearInterval(this.updateEndTimeCurrentTime);
        this.customRangeForm.controls.endTime.patchValue(null);
        this.customRangeForm.controls.endTime.addValidators(Validators.required);
        this.customRangeForm.controls.endTime.enable();
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close({
      type: 'custom',
      startDate: moment(this.customRangeForm.value.startTime).startOf('second').toDate(),
      endDate: this.customRangeForm.value.endTime 
        ? moment(this.customRangeForm.value.endTime).startOf('second').toDate() 
        : undefined,
      endDateCurrentTime: this.customRangeForm.value.endTimeCurrentTime,
    });
  }
}
