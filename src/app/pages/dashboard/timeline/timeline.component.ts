import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange, MatSelectChange } from '@angular/material';
import { SelectOption } from '@hyperiot/components';
import * as d3 from 'd3';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import { TimeAxisComponent } from './time-axis/time-axis.component';

export enum HytDomain {
  Hour = 0,
  Day = 1,
  Month = 2,
  Year = 3
}

export interface HYTData {
  timestamp: Date;
  value: number;
}

@Component({
  selector: 'hyt-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @ViewChild('timeAxis', { static: false }) timeAxis: TimeAxisComponent;

  timeStart: Date;
  timeStop: Date;
  timeDifference: moment.PreciseRangeValueObject;
  domainInterval: HytDomain;

  domainStart: Date;
  domainStop: Date;

  customSelection = false;

  timeOptions: SelectOption[] = [
    {
      label: 'Last hour', value: (): [Date, Date] => {
        this.customSelection = false;
        const referenceTime = new Date();
        return [
          new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours()),
          new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours() + 1)
        ];
      }
    },
    {
      label: 'Last day', value: (): [Date, Date] => {
        this.customSelection = false;
        const referenceTime = new Date();
        return [
          new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate()),
          new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate() + 1)
        ];
      }
    },
    {
      label: 'Last Month', value: (): [Date, Date] => {
        this.customSelection = false;
        const referenceTime = new Date();
        return [
          new Date(referenceTime.getFullYear(), referenceTime.getMonth()),
          new Date(referenceTime.getFullYear(), referenceTime.getMonth() + 1)
        ];
      }
    },
    {
      label: 'Last Year', value: (): [Date, Date] => {
        this.customSelection = false;
        const referenceTime = new Date();
        return [
          new Date(new Date(referenceTime.getFullYear(), 0, 1)),
          new Date(new Date(referenceTime.getFullYear() + 1, 0, 1))
        ];
      }
    },
    {
      label: 'Custom', value: () => {
        this.customSelection = true;
      }
    }
  ];

  timeRange = [
    { label: 'Minutes', value: HytDomain.Hour },
    { label: 'Hours', value: HytDomain.Day },
    { label: 'Days', value: HytDomain.Month },
    { label: 'Months', value: HytDomain.Year }
  ];

  rangeMap = [d3.timeMinute, d3.timeHour, d3.timeDay, d3.timeMonth];

  axisDomain;
  constructor() { }

  ngOnInit() { }

  submitTime(time: [Date, Date]) {
    if (time) {
      this.timeStart = new Date(time[0]);
      this.timeStop = new Date(time[1]);
      const start = moment(this.timeStart);
      const end = moment(this.timeStop);
      this.timeDifference = moment.preciseDiff(start, end, true);
      this.setInterval();
      this.setDomain();

      this.timeAxis.updateAxis([this.domainStart, this.domainStop], this.rangeMap[this.domainInterval]);

      // simulazione chiamata dati
      setTimeout(() => {
        const data = this.fakeRequest();
        this.timeAxis.insertData(data);
      }, 1500);
    }
  }

  setDomain() {
    switch (this.domainInterval) {
      case HytDomain.Hour: {
        this.addMinute(this.timeStop);
        break;
      }
      case HytDomain.Day: {
        this.addHour(this.timeStop);
        break;
      }
      case HytDomain.Month: {
        this.addDay(this.timeStop);
        break;
      }
      case HytDomain.Year: {
        this.addMonth(this.timeStop);
        break;
      }
    }
  }

  timeSelectionChanged(event: MatSelectChange) {
    this.submitTime(event.value());
  }
  setInterval() {
    if (this.timeDifference.years > 0) {
      this.domainInterval = HytDomain.Year;
    } else if (this.timeDifference.months > 0) {
      this.domainInterval = HytDomain.Month;
    } else if (this.timeDifference.days > 0) {
      this.domainInterval = HytDomain.Day;
    } else {
      this.domainInterval = HytDomain.Hour;
    }
  }

  addMinute(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours());
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours() + 1);
  }

  addHour(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate());
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate() + 1);
  }

  addDay(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth());
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth() + 1);
  }

  addMonth(referenceTime: Date) {
    this.domainStart = new Date(new Date(referenceTime.getFullYear(), 0, 1));
    this.domainStop = new Date(new Date(referenceTime.getFullYear() + 1, 0, 1));
  }

  removeMinute(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours() - 1);
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), referenceTime.getHours());
  }

  removeHour(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate() - 1);
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate());
  }

  removeDay(referenceTime: Date) {
    this.domainStart = new Date(referenceTime.getFullYear(), referenceTime.getMonth() - 1);
    this.domainStop = new Date(referenceTime.getFullYear(), referenceTime.getMonth());
  }

  removeMonth(referenceTime: Date) {
    this.domainStart = new Date(new Date(referenceTime.getFullYear() - 1, 0, 1));
    this.domainStop = new Date(new Date(referenceTime.getFullYear(), 0, 1));
  }

  rangeChanged(event: MatButtonToggleChange) {
    this.domainInterval = event.value;
    switch (this.domainInterval) {
      case HytDomain.Hour: {
        this.addMinute(new Date());
        break;
      }
      case HytDomain.Day: {
        this.addHour(new Date());
        break;
      }
      case HytDomain.Month: {
        this.addDay(new Date());
        break;
      }
      case HytDomain.Year: {
        this.addMonth(new Date());
        break;
      }
    }
    this.timeAxis.updateAxis([this.domainStart, this.domainStop], this.rangeMap[event.value]);
  }


  timeBack() {
    switch (this.domainInterval) {
      case HytDomain.Hour: {
        this.removeMinute(this.domainStart);
        break;
      }
      case HytDomain.Day: {
        this.removeHour(this.domainStart);
        break;
      }
      case HytDomain.Month: {
        this.removeDay(this.domainStart);
        break;
      }
      case HytDomain.Year: {
        this.removeMonth(this.domainStart);
        break;
      }
    }
    this.timeAxis.updateAxis([this.domainStart, this.domainStop]);
  }

  timeForward() {
    switch (this.domainInterval) {
      case HytDomain.Hour: {
        this.addMinute(this.domainStop);
        break;
      }
      case HytDomain.Day: {
        this.addHour(this.domainStop);
        break;
      }
      case HytDomain.Month: {
        this.addDay(this.domainStop);
        break;
      }
      case HytDomain.Year: {
        this.addMonth(this.domainStop);
        break;
      }
    }
    this.timeAxis.updateAxis([this.domainStart, this.domainStop]);
  }

  fakeRequest() {
    const fakeData = [];
    const start = this.timeStart.getTime();
    const stop = this.timeStop.getTime();
    for (let i = start; i < stop; i += 60000) {
      fakeData.push({ timestamp: new Date(i), value: Math.random() * 10000 });
    }
    console.log(fakeData);
    return fakeData;
  }

}
