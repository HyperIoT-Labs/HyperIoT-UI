import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import { TimeStep } from 'components';
import { HprojectsService } from 'core';
import * as moment_ from 'moment';
import 'moment-precise-range-plugin';
import { TimeAxisComponent } from './time-axis/time-axis.component';

const moment = moment_;

/**
 * TimelineComponent is an HyperIoT component. It is used by DashboardComponent.
 * It works in the dashboard offline mode and its purpose is to show the amount of data of n packets as a function of time and
 * to give the user the possibility to make a timeSelection to show old saved packet data.
 */
@Component({
  selector: 'hyperiot-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnChanges {

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

  /**
   * Map to domain is used to convert a time step to his next step
   */
  mapToDomain = {
    month: 'year',
    day: 'month',
    hour: 'day',
    minute: 'hour',
    second: 'minute',
    millisecond: 'second'
  };

  /**
   * Map to domain is used to convert a time step to his previous step
   */
  mapToStep = {
    year: 'month',
    month: 'day',
    day: 'hour',
    hour: 'minute',
    minute: 'second',
    second: 'millisecond'
  };

  /**
   * TimeLineData stores the timeline data that will be shown in the timeline
   */
  timeLineData = [];

  /**
   * TimeAxis is the instantiated TimeAxisComponent element
   */
  @ViewChild('timeAxis') timeAxis: TimeAxisComponent;

  /**
   * dateOutput is used to tell the dashboard the new timeSelection selected by the user
   */
  @Output() dateOutput = new EventEmitter<any>();

  /**
   * domainInterval is the current domain step interval
   */
  domainInterval: TimeStep = 'month';

  /**
   * domainStart is the current domain date start
   */
  domainStart: Date;

  /**
   * domainStop is the current domain date end
   */
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

  /**
   * TimelineComponent constructor
   * @param hprojectsService service to require data for the timeline
   */
  constructor(
    private hprojectsService: HprojectsService
  ) {
    this.domainStart = moment(new Date()).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
  }

  /**
   * ngOnChanges() is called after the input has changed. It updates the timeline data.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // this.dashboardPackets, this.projectId
      this.updateTimeline();
  }

  ngAfterViewInit() {
    this.updateTimeline();
  }

  updateTimeline(): void {
    this.timelineDataRequest();
    if (this.timeAxis) {
      this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval);
    }
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

    if (this.dashboardPackets.length === 0) {
      return;
      // TODO send message (toast?) to tell the user to add packet in dashboard
    }

    this.hprojectsService.timelineScan(
      `timeline_hproject_${this.projectId}`,
      this.domainInterval,
      this.domainStart.getTime(),
      this.domainStop.getTime(),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      this.dashboardPackets.toString(),
      ''
    ).subscribe(
      res => {
        this.timeLineData.forEach(element => {
          if (res.some(y => y.timestamp === element.timestamp.getTime())) {
            element.value = res.find(y => y.timestamp === element.timestamp.getTime()).count;
          }
        });
        this.timeAxis.updateData(this.timeLineData);
      },
      // TODO handle error
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
