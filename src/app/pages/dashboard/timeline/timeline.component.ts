import { AfterViewInit, Component, Input, OnInit, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { TimeStep } from '@hyperiot/components';
import { HbaseconnectorsService } from '@hyperiot/core';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import { TimeAxisComponent } from './time-axis/time-axis.component';

export interface HYTData {
  timestamp: Date;
  value: number;
}

@Component({
  selector: 'hyt-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements AfterViewInit, OnChanges {

  @Input()
  projectId;

  @Input()
  dashboardPackets: number[];

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

  mapToGranularity = {
    year: 'hour',
    month: 'hour',
    day: 'hour',
    hour: 'hour',
    minute: 'minute',
    second: 'second'
  };

  timeLineData = [];

  @ViewChild('timeAxis', { static: false }) timeAxis: TimeAxisComponent;

  @Output()
  dateOutput = new EventEmitter<any>();

  timeDifference: moment.PreciseRangeValueObject;
  domainInterval: TimeStep = 'month';

  domainStart: Date;
  domainStop: Date;

  timeSelection = [null, null];

  timeRange: {} = [
    // { label: 'Second', value: 'millisecond' },
    { label: 'Seconds', value: 'second' },
    { label: 'Minutes', value: 'minute' },
    { label: 'Hours', value: 'hour' },
    { label: 'Days', value: 'day' },
    { label: 'Months', value: 'month' }
  ];

  constructor(
    private hBaseConnectorsService: HbaseconnectorsService
  ) {
    this.domainStart = moment(new Date()).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
  }

  ngOnChanges(): void {
    this.fakeRequest();
  }

  ngAfterViewInit() {
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  rangeChanged(value: any) {
    this.domainInterval = value;
    this.domainStart = moment(this.domainStart).startOf(this.mapToDomain[this.domainInterval]).utc().toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  timeBack() {
    this.domainStart = moment(this.domainStart).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  timeForward() {
    this.domainStart = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  drowNewData() {
    this.timeLineData = [];
    const currentDate = moment(this.domainStart).startOf(this.domainInterval);
    const stop = this.domainStop.getTime();
    while (moment(currentDate).valueOf() < stop) {
      this.timeLineData.push({ timestamp: currentDate.toDate(), value: 0 });
      currentDate.add(1, this.domainInterval);
      // TODO input?
    }
  }

  fakeRequest() {

    this.drowNewData();
    this.hBaseConnectorsService.timelineScan(
      `timeline_hproject_${this.projectId}`,
      this.dashboardPackets.toString(),
      this.domainInterval,
      this.mapToGranularity[this.domainInterval],
      this.domainStart.getTime(),
      this.domainStop.getTime()
    ).subscribe(
      res => {
        //TODO IMPORTANT this converion has to be removed
        // res.forEach(element => {
        //   element.timestamp = element.timestamp + (new Date).getTimezoneOffset() * 60 * 1000;
        // });
        this.timeLineData.forEach(element => {
          if (res.some(y => y.timestamp === element.timestamp.getTime())) {
            element.value = res.find(y => y.timestamp === element.timestamp.getTime()).value;
          }
        });
        console.log(res)
        this.timeAxis.updateData(this.timeLineData);
      },
      err => console.log(err)
    );

  }

  dataTimeSelectionChanged(event) {
    this.timeSelection = event;
    this.dateOutput.emit(this.timeSelection);
  }

  changeStep(event) {
    if (this.domainInterval === 'second') {
      return;
    }
    this.domainStart = new Date(event[0]);
    this.domainStop = moment(this.domainStart).add(1, this.domainInterval).toDate();
    this.domainInterval = this.mapToStep[this.domainInterval];
    this.fakeRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  selectedDateChanged(event) {
    this.domainStart = moment(event).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.fakeRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

}
