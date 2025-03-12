import { Component, Input, OnInit, Output, EventEmitter, OnChanges, ViewEncapsulation } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

export type TimeStep = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

interface DateFormat {
  maskFormat: string;
  momentFormat: string;
  pattern: RegExp;
}

const TimeFormat: Record<string, DateFormat> = {
  year: {
    maskFormat: '0000',
    momentFormat: 'YYYY',
    pattern: new RegExp(/^(\d{4})$/)
  },
  month: {
    maskFormat: '0000/00',
    momentFormat: 'YYYY/MM',
    pattern: new RegExp(/^(\d{4})\/(\d{2})$/)
  },
  day: {
    maskFormat: '0000/00/00',
    momentFormat: 'YYYY/MM/DD',
    pattern: new RegExp(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  },
  hour: {
    maskFormat: '0000/00/00 00',
    momentFormat: 'YYYY/MM/DD HH',
    pattern: new RegExp(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2})$/)
  },
  minute: {
    maskFormat: '0000/00/00 00:00',
    momentFormat: 'YYYY/MM/DD HH:mm',
    pattern: new RegExp(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})$/)
  },
  second: {
    maskFormat: '0000/00/00 00:00:00',
    momentFormat: 'YYYY/MM/DD HH:mm:ss',
    pattern: new RegExp(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  },
  millisecond: {
    maskFormat: '0000/00/00 00:00:00.000',
    momentFormat: 'YYYY/MM/DD HH:mm:ss.SSS',
    pattern: new RegExp(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/)
  }
};

/** @title Datepicker emulating a Year and month picker */
@Component({
  selector: 'hyt-date-picker',
  templateUrl: 'hyt-date-picker.component.html',
  styleUrls: ['hyt-date-picker.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HytDatePickerComponent implements OnInit, OnChanges {

  /**
   * Input of the style class
   */
  @Input()
  color: string = 'hyt-base-default-white';

  /**
   * Default selected date
   */
  @Input()
  date: Date = new Date();

  /**
   * Min time step selectable
   */
  @Input()
  minStep: TimeStep = 'day';

  /**
   * RegExp pattern of input field
   */
  @Input()
  pattern: RegExp = new RegExp('');

  /**
   * Language code for the time format
   */
  @Input()
  languageCode: string = 'en';

  /**
   * Boolean to manage the popup visibility
   */
  showPopup = false;

  /**
   * Value of ngModel
   */
  dateString = '';

  /**
   * Output of the selected date changes
   */
  @Output()
  selectedDate: EventEmitter<Date> = new EventEmitter<Date>();

  /**
   * Date error status
   */
  dateError = false;

  /**
   * Input mask
   */
  actualMask: string;

  initialValue: string;

  constructor() { }

  /**
   * This is an angular lifecycle hook that initializes the data.
   */
  ngOnInit(): void {
    this.actualMask = TimeFormat[this.minStep].maskFormat;
    this.pattern = TimeFormat[this.minStep].pattern;
    //TODO replace with changeDetection
    setTimeout(() => {
      this.dateString = moment(this.date).format(TimeFormat[this.minStep].momentFormat);
      this.initialValue = this.dateString;
    }, 0);
  }

  /**
   * ngOnChanges() is called after the input has changed. It updates the timeline data.
   */
  ngOnChanges(): void {
    this.actualMask = TimeFormat[this.minStep].maskFormat;
    this.pattern = TimeFormat[this.minStep].pattern;
    //TODO replace with changeDetection
    setTimeout(() => {
      this.dateString = moment(this.date).format(TimeFormat[this.minStep].momentFormat);
    }, 0);
  }

  /**
   * Open the calendar pop up
   */
  openCal() {
    this.showPopup = !this.showPopup;
  }

  /**
   * Close the pop up and set the date value
   * @param event
   */
  setDate(event: moment_.Moment) {
    this.showPopup = false;
    this.date = event.toDate();
    this.dateString = moment(this.date).format(TimeFormat[this.minStep].momentFormat);
    // this.selectedDate.emit(this.date);
  }

  /**
   * Emit the new data value
   */
  submit() {
    const arr = this.dateString.split(/[\/\s\:]+/);
    const dateString = `${+arr[0] || 0}/${+arr[1] || 1}/${+arr[2] || 1} ${+arr[3] || '00'}:${+arr[4] || '00'}:${+arr[5] || '00'}`;
    const date = new Date(dateString);
    if (date.toString() === 'Invalid Date') {
      this.dateError = true;
    } else {
      this.date = date;
      this.selectedDate.emit(this.date);
    }
  }

}
