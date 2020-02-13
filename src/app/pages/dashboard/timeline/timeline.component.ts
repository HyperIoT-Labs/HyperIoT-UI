import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
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

  /**
   * Project id of the select dashboard
   */
  @Input()
  projectId;

  /**
   * Packets in the selected dashboard
   */
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

  /**
   * The timeline selected time
   */
  timeSelection = [null, null];

  /**
   * Selectable time steps
   */
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

  /**
   * ngOnChanges() is called after the input has changed. It updates the timeline data.
   */
  ngOnChanges(): void {
    this.timelineDataRequest();
  }

  /**
   * ngAfterViewInit() builds the chart.
   */
  ngAfterViewInit() {
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }


  /**
   * This function is called after the user select a step from the mat-button-toggle-group.
   * @param value The selected step
   */
  rangeChanged(value: string) {
    this.domainInterval = value as TimeStep;
    this.domainStart = moment(this.domainStart).startOf(this.mapToDomain[this.domainInterval]).utc().toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  /**
   * This function is called when the 'timeBack' button is pressed. It updates the timeLine domain and his data.
   */
  timeBack() {
    this.domainStart = moment(this.domainStart).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).subtract(1, this.mapToDomain[this.domainInterval]).toDate();
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  /**
   * This function is called when the 'timeForward' button is pressed. It updates the timeLine domain and his data.
   */
  timeForward() {
    this.domainStart = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStop).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  /**
   * This function is called to map the timeLine data values
   */
  drowNewData() {
    this.timeLineData = [];
    const currentDate = moment(this.domainStart);
    const stop = this.domainStop.getTime();
    while (moment(currentDate).valueOf() < stop) {
      this.timeLineData.push({ timestamp: currentDate.toDate(), value: 0 });
      currentDate.add(1, this.domainInterval);
    }
  }

  /**
   * This function is called to download the timeline data
   */
  timelineDataRequest() {

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
        //console.log(res)
        this.timeAxis.updateData(this.timeLineData);
      },
      err => console.log(err)
    );

  }

  /**
   * This function is called from the timeline. It is called after the user select a range of time.
   * It emits the selection in the dashboard.
   * @param event the time selected by the user
   */
  dataTimeSelectionChanged(event: [Date, Date]) {
    this.timeSelection = event;
    this.dateOutput.emit(this.timeSelection);
  }

  /**
   * This function is called from the timeline. It is called to update the timeline domain.
   * @param event The Date returned as output from the timeLine.
   */
  changeStep(event: Date) {
    if (this.domainInterval === 'second') {
      return;
    }
    this.domainStart = new Date(event);
    this.domainStop = moment(this.domainStart).add(1, this.domainInterval).toDate();
    this.domainInterval = this.mapToStep[this.domainInterval];
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

  /**
   * This function is called when hyt-date-picker returns a new Date
   * @param event The Date returned by the hyt-date-picker
   */
  selectedDateChanged(event: Date) {
    this.domainStart = moment(event).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
  }

}
