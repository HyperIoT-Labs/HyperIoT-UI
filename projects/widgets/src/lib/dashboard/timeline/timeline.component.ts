import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ConfirmDialogService, DialogService, SelectOption, TimeStep } from 'components';
import { HProjectService } from 'core';
import * as moment_ from 'moment';
import 'moment-precise-range-plugin';
import { TimeAxisComponent } from './time-axis/time-axis.component';
import { DashboardEventService } from '../services/dashboard-event.service';
import { DataExport } from './models/data-export,model';
import { DataExportComponent } from './data-export/data-export.component';
import { MatSelectChange } from '@angular/material/select';
import { DefaultTimelineCustomRange, DefaultTimelineRange, DefaultTimelineRangeType, DefaultTimelineRangeTypeUtilsMap } from '../model/dashboardTimelineDefaultRange';
import { CustomDefaultSelectionDialogComponent } from '../custom-default-selection-dialog/custom-default-selection-dialog.component';
import { asyncScheduler, PartialObserver, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CustomTimeLineRangeHandler, LastMonthTimeLineRangeHandler, LastWeekTimeLineRangeHandler, NoneTimeLineRangeHandler } from '../model/DefaultTimelineRangeUtils';

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

  @Input()
  defaultRange: DefaultTimelineRange;

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

  @Output() defaultRangeChanged = new EventEmitter<{ defaultTimelineRange: DefaultTimelineRange, responseHandler: PartialObserver<any> }>();

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

  defaultTimelineRange: DefaultTimelineRangeType = 'none';
  lastDefaultTimelineRange: DefaultTimelineRangeType = 'none';
  defaultTimelineRangeOptions: (Omit<SelectOption, 'value'> & { value: DefaultTimelineRangeType })[] = [
    { value: 'none', label: NoneTimeLineRangeHandler.label },
    { value: 'lastWeek', label: LastWeekTimeLineRangeHandler.label },
    { value: 'lastMonth', label: LastMonthTimeLineRangeHandler.label },
    { value: 'custom', label: CustomTimeLineRangeHandler.label },
  ];

  /**
   * TimelineComponent constructor
   * @param hprojectsService service to require data for the timeline
   */
  constructor(
    private confirmDialogService: ConfirmDialogService,
    private toastr: ToastrService,
    private hprojectsService: HProjectService,
    private dashboardEvent: DashboardEventService,
    private dialogService: DialogService
  ) {
    this.domainStart = moment(new Date()).startOf(this.mapToDomain[this.domainInterval]).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval]).toDate();
  }

  /**
   * ngOnChanges() is called after the input has changed. It updates the timeline data.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.updateTimeline();
  }

  ngAfterViewInit() {
    asyncScheduler.schedule(() => {
      if (this.defaultRange) {
        this.updateDefaultTimelineRangeSelection();
        this.updateDefaultTimelineRangeOptions();
      } else {
        this.updateTimeline();
      }
    }, 0);
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

  timelineRequest: Subscription;
  /**
   * This function is called to download the timeline data
   */
  timelineDataRequest() {

    this.drowNewData();

    if (this.dashboardPackets.length === 0) {
      return;
      // TODO send message (toast?) to tell the user to add packet in dashboard
    }

    if (this.timelineRequest) {
      this.timelineRequest.unsubscribe();
    }

    this.timelineRequest = this.hprojectsService.timelineScan(
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

  openDataExportModel() {
    this.dialogService.open<DataExportComponent, DataExport>(
      DataExportComponent,
      {
        data: {
          projectId: this.projectId,
          timeInterval: this.timeSelection
        },
        height: '600px',
        width: '600px',
        backgroundClosable: true,
      }
    );
  }

  updateDefaultTimelineRangeOptions() {
    const customOption = this.defaultTimelineRangeOptions.find(x => x.value === 'custom');
    if (!customOption) {
      return;
    }
    if (this.defaultRange && this.defaultRange.type === 'custom') {
      customOption.label = CustomTimeLineRangeHandler.getConfirmMessage(this.defaultRange);
    } else {
      customOption.label = CustomTimeLineRangeHandler.label;
    }
  }

  updateDefaultTimelineRangeSelection() {
    if (!this.defaultRange) {
      this.updateTimeline();
      return;
    }

    this.defaultTimelineRange = this.defaultRange.type;
    this.lastDefaultTimelineRange = this.defaultTimelineRange;

    if (this.defaultRange.type === 'none') {
      this.updateTimeline();
      return;
    }

    const timelineRangeUtils = DefaultTimelineRangeTypeUtilsMap.get(this.defaultRange.type);
    const timeInterval: [Date, Date] = timelineRangeUtils.buildInterval(this.defaultRange);
    this.domainInterval = timelineRangeUtils.domainInterval(this.defaultRange);

    this.domainStart = moment(timeInterval[1]).startOf(this.mapToDomain[this.domainInterval] as any).toDate();
    this.domainStop = moment(this.domainStart).add(1, this.mapToDomain[this.domainInterval] as any).toDate();
    this.timelineDataRequest();
    this.timeAxis.updateAxis(this.timeLineData, [this.domainStart, this.domainStop], this.domainInterval, timeInterval);
    this.dataTimeSelectionChanged(timeInterval);
  }

  onDefaultTimelineRangeChange(event: MatSelectChange) {
    const selectedOption = this.defaultTimelineRangeOptions.find(x => x.value === this.defaultTimelineRange);
    if (!selectedOption || !selectedOption.value) {
      return;
    } else if (selectedOption.value === 'custom') {
      const customRangeDialogRef = this.dialogService.open<CustomDefaultSelectionDialogComponent, undefined, DefaultTimelineCustomRange>(CustomDefaultSelectionDialogComponent);
      customRangeDialogRef.dialogRef.afterClosed().subscribe(
        res => {
          if (res) {
            this.defaultTimelineRangeChangeConfirm(res);
          } else {
            this.defaultTimelineRange = this.lastDefaultTimelineRange;
          }
        }
      );
    } else {
      this.defaultTimelineRangeChangeConfirm({ type: selectedOption.value });
    }
  }

  defaultTimelineRangeChangeConfirm(newDefaultTimelineRange: DefaultTimelineRange) {
    const timelineRangeUtils = DefaultTimelineRangeTypeUtilsMap.get(newDefaultTimelineRange.type);
    let selectionMessage = timelineRangeUtils.getConfirmMessage(newDefaultTimelineRange);

    const dialogRef = this.confirmDialogService.open({
      header: $localize`:@@HYT_default_timeline_range_confirm_header:Set Default Timeline Selection`,
      text:  $localize`:@@HYT_default_timeline_range_confirm_text:Attention! Proceeding with this action will set the default time range for this dashboard to: ${selectionMessage}`,
    });
    dialogRef.dialogRef.afterClosed().subscribe(
      res => {
        if (res && res.result === 'accept') {
          const responseHandler: PartialObserver<any> = {
            next: res => {
              this.lastDefaultTimelineRange = this.defaultTimelineRange;
              this.defaultRange = newDefaultTimelineRange;
              this.updateDefaultTimelineRangeOptions();
              this.toastr.success($localize`:@@HYT_success_saving_default_timeline_range:Default timeline range saved successfully`, $localize`:@@HYT_error:Success`);
            },
            error: err => {
              this.defaultTimelineRange = this.lastDefaultTimelineRange;
              this.toastr.error($localize`:@@HYT_error_saving_default_timeline_range:Error saving default timeline range`, $localize`:@@HYT_error:Error`);
            }
          };
          this.defaultRangeChanged.emit({defaultTimelineRange: newDefaultTimelineRange, responseHandler});
        } else {
          this.defaultTimelineRange = this.lastDefaultTimelineRange;
        }
      }
    );
  }

}
