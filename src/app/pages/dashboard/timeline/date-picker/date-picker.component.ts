import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hyt-date-picker-int',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  customTimeStart: Date;
  customTimeStop: Date;

  @Output()
  customTime: EventEmitter<[Date, Date]> = new EventEmitter<[Date, Date]>();

  constructor() { }

  ngOnInit() {
    const refDate = new Date();
    refDate.setSeconds(0);
    refDate.setMilliseconds(0);
    this.customTimeStart = new Date(refDate.getTime() - 86400000); // - 24 hrs
    this.customTimeStop = new Date(refDate);
  }

  timeStartChanged(date) {
    this.customTimeStart = new Date(date);
  }
  timeStopChanged(date) {
    this.customTimeStop = new Date(date);
  }

  submitCustomTime() {
    console.log(this.customTimeStart);
    if (!(isNaN(this.customTimeStart.valueOf()) || isNaN(this.customTimeStop.valueOf()))) {
      this.customTime.emit([this.customTimeStart, this.customTimeStop]);
    } else {
      this.customTimeStart = null;
      this.customTimeStop = null;
    }
  }

}
