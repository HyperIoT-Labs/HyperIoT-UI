import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonToggleChange, MatSelectChange } from '@angular/material';
import { SelectOption } from '@hyperiot/components';
import * as d3 from 'd3';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import { TimeAxisComponent } from './time-axis/time-axis.component';

//TODO find better position
export type TimeStep = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

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

  mapToDomain = {
    month: 'year',
    day: 'month',
    hour: 'day',
    minute: 'hour',
    second: 'minute',
    millisecond: 'second'
  };

  mapToStep = {
    year: 'month',
    month: 'day',
    day: 'hour',
    hour: 'minute',
    minute: 'second',
    second: 'millisecond'
  };

  @ViewChild('timeAxis', { static: false }) timeAxis: TimeAxisComponent;


  timeStart: Date;
  timeStop: Date;
  timeDifference: moment.PreciseRangeValueObject;
  domainInterval: TimeStep;

  domainStart: Date;
  domainStop: Date;

  timeSelection = [null, null];

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

  timeRange: {} = [
    // { label: 'Second', value: 'millisecond' },
    { label: 'Second', value: 'second' },
    { label: 'Minute', value: 'minute' },
    { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Month', value: 'month' }
  ];

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

      this.fakeRequest();
      this.timeAxis.updateAxis([this.domainStart, this.domainStop], this.domainInterval);
    }
  }

  setDomain() {
    this.domainStart = moment(this.timeStart).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
  }

  timeSelectionChanged(event: MatSelectChange) {
    this.submitTime(event.value());
  }
  setInterval() {
    console.log(this.timeDifference);
    if (this.timeDifference.years > 0) {
      this.domainInterval = 'month';
    } else if (this.timeDifference.months > 0) {
      this.domainInterval = 'day';
    } else if (this.timeDifference.days > 0) {
      this.domainInterval = 'hour';
    } else {
      this.domainInterval = 'minute';
    }
  }

  rangeChanged(event: MatButtonToggleChange) {
    this.domainInterval = event.value;
    this.domainStart = moment(this.domainStart).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    console.log(this.domainStart);
    console.log(this.domainStop)
    this.fakeRequest();
    this.timeAxis.updateAxis([this.domainStart, this.domainStop], this.domainInterval);
  }

  timeBack() {
    this.domainStart = moment(this.domainStart).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis([this.domainStart, this.domainStop]);
  }

  timeForward() {
    this.domainStart = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis([this.domainStart, this.domainStop]);
  }

  fakeData

  drowNewData() {
    this.fakeData = [];

    const dateStart = new Date(Math.max.apply(null, [this.timeStart, this.domainStart]));
    const dateStop = new Date(Math.min.apply(null, [this.timeStop, this.domainStop]));

    const currentDate = moment(dateStart).startOf(this.domainInterval);
    const stop = dateStop.getTime();
    // console.log()
    console.log(this.domainInterval);
    while (moment(currentDate).valueOf() < stop) {
      this.fakeData.push({ timestamp: currentDate.toDate(), value: Math.random() * 0 });
      currentDate.add(1, this.domainInterval);
      // TODO input?
      this.timeAxis.data = this.fakeData;
    }
  }

  fakeRequest() {
    this.drowNewData();
    setTimeout(() => {
      this.fakeData.forEach(element => {
        element.value = Math.random() * 10000;
      });
      this.timeAxis.updateData(this.fakeData);
    }, 500);
  }

  dataTimeSelectionChanged(event) {
    this.timeSelection = event;
  }

  changeStep(event) {
    if (this.domainInterval === 'second') {
      return;
    }
    this.domainStart = new Date(event[0]);
    this.domainStop = moment(this.domainStart).add(1, this.domainInterval).toDate();
    this.domainInterval = this.mapToStep[this.domainInterval];
    this.fakeRequest();
    this.timeAxis.updateAxis([this.domainStart, this.domainStop], this.domainInterval);
  }

  button() {

    // console.log(this.domainInterval);
  }


  yearOption: SelectOption[] = [
    { value: 2018, label: '2018' },
    { value: 2019, label: '2019' },
    { value: 2020, label: '2020' },
    { value: 2021, label: '2021' }
  ];

  yearChanged(event){
    this.timeStart = moment(new Date().setFullYear(event.value)).startOf('year').toDate();
    this.timeStop = moment(this.timeStart).add(1, 'year').toDate();
    this.submitTime([this.timeStart, this.timeStop]);

  }

}
