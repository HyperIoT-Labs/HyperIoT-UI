import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeFormats } from '@danielmoncada/angular-datetime-picker';
import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from '@danielmoncada/angular-datetime-picker-moment-adapter';

export const DATETIME_PICKER_FORMATS: OwlDateTimeFormats = {
  parseInput: 'l LTS',
  fullPickerInput: 'l LTS',
  datePickerInput: 'l',
  timePickerInput: 'LTS',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

export const DATETIME_PICKER_PROVIDERS = [
  { provide: OWL_DATE_TIME_LOCALE, useValue: 'it-IT' },
  { provide: OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS, useValue: { useUtc: false } },
  { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS] },
  { provide: OWL_DATE_TIME_FORMATS, useValue: DATETIME_PICKER_FORMATS },
];

export const timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startTime')?.value;
  const end = control.get('endTime')?.value;

  if (!start || !end) {
    return null;
  }

  return start < end ? null : { timeRangeInvalid: true };
};
