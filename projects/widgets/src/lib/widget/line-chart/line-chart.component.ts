import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DataChannel,
  DataPacketFilter,
  Logger,
  LoggerService,
  PacketData,
  RuleEngineService,
} from 'core';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';
import {
  Subscription,
  asyncScheduler,
  bufferTime,
  filter,
  map,
  withLatestFrom,
} from 'rxjs';

import { BaseChartComponent } from '../../base/base-chart/base-chart.component';
import { ConfigButtonWidget, Threshold, Trend, WidgetAction } from '../../base/base-widget/model/widget.model';
import { TimeSeries } from '../../data/time-series';
import { ServiceType } from '../../service/model/service-type';
import { DashboardEventService } from '../../dashboard/services/dashboard-event.service';
import { DashboardEvent } from '../../dashboard/services/dashboard-event.model';

import { linearRegression, linearRegressionLine } from 'simple-statistics';

type TrendField = {
  index: number;
  trendValue: number;
}

@Component({
  selector: 'hyperiot-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: [
    '../../../../../../src/assets/widgets/styles/widget-commons.css',
    './line-chart.component.css',
  ],
})
export class LineChartComponent extends BaseChartComponent implements OnInit, OnDestroy {
  @ViewChild('lineChartPlotly') lineChartPlotly: PlotlyComponent;
  lowerBound = 0;
  sideMarginGap = 0.12;
  fieldsName: any[] = [];
  get initToolbarConfig(): ConfigButtonWidget {
    return {
      showClose: true,
      showSettings: true,
      showPlay: this.serviceType === this.serviceTypeList.ONLINE,
      showRefresh: false,
      showTable: false,
      hideFullScreen: this.isLoadingData(),
    }
  }

  dataChannel: DataChannel;
  channelId: number;
  dataSubscription: Subscription;
  offControllerSubscription: Subscription;

  lastRequestedDate: Date;
  lastOfflineDate: Date;
  loadingOfflineData = false;

  allData: PacketData[] = [];

  thresholds: Threshold[] = [];
  trend: Trend = null;
  trendValues: TrendField[] = [];
  trendIndex: number;

  protected logger: Logger;

  private _chartConfig = {
    scrollZoom: true,
    displayModeBar: 'hover',
    displaylogo: false,
    modeBarButtonsToRemove: [
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines',
      'autoScale2d',
    ],
    modeBarButtonsToAdd: [],
    editable: false,
    showAxisDragHandles: false,
  };

  get chartConfig() {
    return this._chartConfig;
  }

  readonly accumulator = [];

  constructor(
    injector: Injector,
    private dashboardEvent: DashboardEventService,
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService,
    private ruleService: RuleEngineService
  ) {
    super(injector, plotly, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(LineChartComponent.name);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();

    if (this.serviceType === ServiceType.OFFLINE) {
      this.plotly.getPlotly().then((plotly) => {
        this._chartConfig.modeBarButtonsToAdd.push({
          name: $localize`:@@HYT_plotly_fit_to_timeline:Fit to timeline`,
          icon: plotly.Icons.autoscale,
          click: async (el) => {
            await this.fitToTimeline(plotly, el);
          },
        });
      });

      this.dashboardEvent.timelineEvent.subscribe(async (res) => {
        this.loadingOfflineData = false;
        if (res == DashboardEvent.Timeline.RESET) {
          this.reset();
        }

        if (res == DashboardEvent.Timeline.NEW_RANGE) {
          this.reset();
          await this.newRange();
        }

        if (res == DashboardEvent.Timeline.REFRESH) {
          this.reset();
          await this.newRange();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.offControllerSubscription?.unsubscribe();

    this.dataSubscription?.unsubscribe();
    this.dataService?.removeDataChannel(this.channelId);

    super.ngOnDestroy();
  }

  private async fitToTimeline(plotly?: any, element?: PlotlyComponent): Promise<void> {
    if (plotly) {
      plotly.relayout(element, {
        'xaxis.autorange': true,
        'yaxis.autorange': true,
      });
    } else {
      await this.newRange();
    }

    if (!this.dataChannel.controller.rangeLoaded) {
      this.dataService.loadAllRangeData(this.channelId);
    }
  }

  private reset() {
    this.lastOfflineDate = null;
    this.lastRequestedDate = null;
    this.allData = [];
    this.removeOldTrend(this.trendIndex)
  }

  private async newRange(): Promise<void> {
    this.removeOldTrend(this.trendIndex)
    const plotly = await this.plotly.getPlotly();
    const graph = this.plotly.getInstanceByDivId(
      `widget-${this.widget.id}${this.isToolbarVisible}`
    );
    plotly?.relayout(graph, {
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    });
  }

  removeOldTrend(index): void {
      if (index && this.graph.layout.shapes) this.graph.layout.shapes.splice(index, 1);
  }

  configure(): void {
    this.graph.layout = {};
    this.graph.data = [];
    this.allData = [];

    super.removeSubscriptionsAndDataChannels();
    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
      return;
    }

    super.configure();

    if (
      !(
        this.widget.config != null &&
        this.widget.config.packetId != null &&
        this.widget.config.packetFields != null &&
        Object.keys(this.widget.config.packetFields).length > 0
      )
    ) {
      this.isConfigured = false;
      return;
    }
    this.isConfigured = true;

    if (this.widget.config.threshold?.thresholdActive) {
      this.thresholds = this.widget.config.threshold.thresholds;
      this.retrieveThresholds();
    }

    // scheduling chart initialization because of chart size
    asyncScheduler.schedule(() => {
      this.setTimeSeries();
      this.setTimeChartLayout();
    });
  }

  async subscribeAndInit(): Promise<void> {
    this.logger.debug('subscribeAndInit');

    this.subscribeDataChannel();

    if (this.serviceType === ServiceType.ONLINE) {
      await this.computePacketData(this.initData, this.isToolbarVisible);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const graph = this.plotly.getInstanceByDivId(
        `widget-${this.widget.id}${this.isToolbarVisible}`
      );
      if (graph) {
        this.plotly.resize(graph);
      }
    });
    resizeObserver.observe(
      document.querySelector(
        `#widget-${this.widget.id}${this.isToolbarVisible}`
      )
    );
  }

  private subscribeDataChannel(): void {
    this.logger.debug('subscribeDataChannel');
    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );

    this.channelId = +this.widget.id;

    if (this.isToolbarVisible) {
      this.dataChannel = this.dataService.addDataChannel(this.channelId, [dataPacketFilter]);
    } else {
      // setting negative id to fullscreen offline widget to prevent updating original widget
      // TODO channelId should be a proper string
      this.channelId = -this.channelId;
      this.dataChannel = this.dataService.copyDataChannel(this.channelId, -this.channelId);
    }

    if (this.widget.config.trend?.trendActive) {
      this.dataSubscription = this.dataChannel.subject
        .pipe(
          map((dataChunk) => dataChunk.data),
          bufferTime(this.widget.config.refreshIntervalMillis || 0),
          filter((data) => data.length !== 0),
          map((data) => [].concat.apply([], data)),
          withLatestFrom(this.dataChannel.controller.$totalCount),
        ).subscribe({
          next: async ([eventData, totalCount]) => {
            this.loadingOfflineData = true;

            this.accumulator.push(...eventData);

            if (totalCount === this.accumulator.length) {
              this.loadingOfflineData = false;

              const filteredEvent = this.accumulator.filter(obj => {
                return Object.values(this.widget.config.packetFields).some(prop => obj.hasOwnProperty(prop));
              });

              await this.computePacketData(filteredEvent);

              this.accumulator.length = 0;
            }
          }
        });
    } else {
      this.dataSubscription = this.dataChannel.subject
        .pipe(
          map((dataChunk) => dataChunk.data),
          bufferTime(this.widget.config.refreshIntervalMillis || 0),
          filter((data) => data.length !== 0),
          map((data) => [].concat.apply([], data))
        )
        .subscribe(async (eventData: PacketData[]) => {
          const filteredEvent = eventData.filter(obj => {
            return Object.values(this.widget.config.packetFields).some(prop => obj.hasOwnProperty(prop));
          });

          await this.computePacketData(filteredEvent);
        });
    }

    if (this.serviceType === ServiceType.OFFLINE) {
      this.logger.debug('subscribeAndInit - OFFLINE Service');
      this.offControllerSubscription =
        this.dataChannel.controller.$totalCount
          .subscribe(async (res: number) => {
            if (this.isToolbarVisible) {
              if (res > 0) {
                this.allData = [];

                this.graph.data.forEach((tsd) => {
                  tsd.x = [];
                  tsd.y = [];
                });

                if (this.widget.config.fitToTimeline || this.widget.config.trend?.trendActive) {
                  await this.fitToTimeline();
                } else {
                  this.dataRequest();
                }
              }
            } else { // if fullscreen
              await this.computePacketData(this.initData, this.isToolbarVisible);
            }
          });
    }
  }

  async computePacketData(packetData: PacketData[], convertOldValues = true): Promise<void> {
    this.logger.debug('computePacketData', packetData);

    if (packetData.length === 0) {
      return;
    }

    this.allData = this.allData.concat([...packetData]);

    super.computePacketData(packetData, convertOldValues);

    // Here you ONLY CALCULATE the trend values
    if (this.widget.config.trend?.trendActive) {
      this.trend = this.widget.config.trend.trend;
      this.calculateTrend(this.allData);
    }

    this.logger.debug('convertAndBufferData');
    packetData.forEach((datum) => {
      if (
        new Date(datum.timestamp) > this.lastOfflineDate ||
        !this.lastOfflineDate
      ) {
        this.lastOfflineDate = new Date(datum.timestamp);
      }

      this.convertAndBufferData(datum);
    });

    await this.renderBufferedData();
    this.loadingOfflineData = false;
    if (this.serviceType === ServiceType.OFFLINE) {
      this.lowerBound++;

      this.logger.debug('updateDataRequest');
      this.updateDataRequest();
    }
  }

  /*
    Retrive each threshold and save the corresponding rule
  */
  private retrieveThresholds(): void {
    this.thresholds.forEach(threshold => {
      if (!threshold.rule) {
        return;
      }

      const ruleDefinition = threshold.rule.replace(/'/g, '').trim();
      const ruleArray: string[] = ruleDefinition.match(/[^AND|OR]+(AND|OR)?/g).map(x => x.trim());
      this.addThresholdToChart(threshold, ruleArray);

      // this.ruleService.findRule(parseInt(threshold.id)).subscribe({
      //   next: (data) => {
      //     threshold.rule = data.ruleDefinition;

      //     if (!threshold.rule) {
      //       return;
      //     }

      //     const ruleDefinition = threshold.rule.replace(/'/g, '').trim();
      //     const ruleArray: string[] = ruleDefinition.match(/[^AND|OR]+(AND|OR)?/g).map(x => x.trim());
      //     this.addThresholdToChart(threshold, ruleArray, data.name);
      //   },
      //   error: (err) => {
      //     console.error('Error retrieving thresholds', err);
      //   }
      // })
    });
  }

  private setTimeChartLayout(): void {
    this.logger.debug('setTimeChartLayout');
    this.chartData.forEach((timeSeries, i) => {
      const fieldName = timeSeries.label;
      const a = i + 1;
      if (a === 1) {
        this.graph.layout[`yaxis`] = {
          title: fieldName,
          domain: [0.15, 0.85],
        };
      } else {
        this.graph.layout[`yaxis${a}`] = {
          title: fieldName,
          autorange: true,
          anchor: 'free',
          overlaying: 'y',
          side: 'right',
          position: 1 - i * this.sideMarginGap,
        };
      }

      const tsd = {
        name: fieldName,
        x: [],
        y: [],
        yaxis: 'y' + (i + 1),
        type: '',
      };

      Object.assign(tsd, this.defaultSeriesConfig);
      this.graph.data.push(tsd);
    });

    // Set up legend and other layout settings
    this.graph.layout.showlegend = true;

    this.graph.layout.legend = {
      orientation: 'h',
      x: 0.25,
      y: 1,
      traceorder: 'normal',
      font: {
        family: 'sans-serif',
        size: 10,
        color: '#000',
      },
      bgcolor: '#FFFFFF85',
      borderwidth: 0,
    };

    this.graph.layout.font = {
      size: 9,
    };
    this.graph.layout.title = null;

    this.graph.layout.dragmode = 'pan';

    this.graph.layout.responsive = true;

    this.graph.layout.autosize = true;

    this.graph.layout.margin = {
      l: 24,
      r: 24,
      b: 0,
      t: 0,
      pad: 0,
    };

    this.graph.layout.xaxis = {
      type: 'date',
      showgrid: false,
      range: [],
    };
  }

  private regressionLine(data: PacketData[], fieldName: string): TrendField[] {

    const regressionData = data
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .filter(datum => datum[fieldName] != null)
      .map((datum, index) => [
        index,                                // x = ordine temporale crescente
        parseFloat(datum[fieldName])          // y = valore
    ]);

    const lr = linearRegression(regressionData); // { m, b }
    const line = linearRegressionLine(lr);
    const regressionLinePoints: [number, number][] = regressionData.map(([x]) => [x, line(x)]);

    return regressionLinePoints.map(([x, y]) => ({
      index: x,
      trendValue: y
    }));
  }

  private calculateTrend(data: PacketData[]): void {
    this.trendValues = this.regressionLine(data, this.trend.fieldName);
  }

  private addTrendToChart(trend: Trend, trendData: TrendField[]): void {
    if (!this.graph.layout.shapes) {
      this.graph.layout.shapes = [];
    }

    //rimuovo vecchio trend
    if (this.trendIndex) {
      this.graph.layout.shapes.splice(this.trendIndex, 1);
    }

    this.graph.layout.shapes.push({
      type: 'line',
      xref: 'paper',

      // Through any two points, there is exactly one straight line        
      x0: 0,
      y0: trendData[0].trendValue,

      x1: 1,
      y1: trendData[1].trendValue,

      yref: 'y',
      line: {
        color: trend.line.color,
        width: trend.line.thickness,
        dash: this.getLineDash(trend.line.type)
      },
    });

    // update current index
    this.trendIndex = this.graph.layout.shapes.length - 1;
  }

  private addThresholdToChart(threshold: Threshold, ruleArray: string[]): void {
    if (!this.graph.layout.shapes) {
      this.graph.layout.shapes = [];
    }

    /* TODO atm we only handle  */
    // if (ruleArray.length > 2) {
    //   return;
    // }

    if (ruleArray.length === 1) {
      this.addSingleThreshold(ruleArray[0], threshold);
    } else if (ruleArray.length === 2 && ruleArray[0].includes('AND')) {
      const values = [];

      ruleArray.forEach(rule => {
        this.retrieveRuleValues(rule, values);
      });

      this.graph.layout.shapes.push(
        {
          type: 'rect',
          xref: 'paper',
          x0: 0,
          y0: values[0],

          x1: 1,
          y1: values[1],
          yref: 'y',
          fillcolor: threshold.line.color,
          line: {
            width: 0,
          },
        }
      );
    } else {
      for (let i = 0; i < ruleArray.length; i++) {
        if (
          ruleArray[i].includes('OR') ||
          !(ruleArray[i].includes('OR') && ruleArray[i].includes('AND'))
        ) {
          this.addSingleThreshold(ruleArray[i], threshold);
        } else {
          const values: number[] = [];

          this.retrieveRuleValues(ruleArray[i], values);
          this.retrieveRuleValues(ruleArray[i++], values);

          this.graph.layout.shapes.push(
            {
              type: 'rect',
              xref: 'paper',
              x0: 0,
              y0: values[0],

              x1: 1,
              y1: values[1],
              yref: 'y',
              fillcolor: threshold.line.color,
              line: {
                width: 0,
              },
            }
          );
        }
      }
    }
    //this.addScatterTrace(threshold, ruleName);
  }

  private addScatterTrace(threshold: Threshold, ruleName: string): void {
    this.graph.data.push({
      x: [null],
      y: [null],
      mode: 'markers',
      marker: {
        color: threshold.line.color,
        size: 12
      },
      name: ruleName,
      showlegend: true,
      hoverinfo: 'skip'
    });
  }

  private retrieveRuleValues(rule: string, values: number[]): void {
    const tempSplitted = rule.split(' ');

    const value = tempSplitted.length > 1
      ? parseFloat(tempSplitted[2].replace(/"/g, ''))
      : undefined;

    if (value) {
      values.push(value);
    }
  }

  private addSingleThreshold(rule: string, threshold: Threshold): void {
    const tempSplitted = rule.split(' ');

    const value = tempSplitted.length > 1
      ? parseFloat(tempSplitted[2].replace(/"/g, ''))
      : undefined;

    if (value) {
      this.graph.layout.shapes.push({
        type: 'line',
        xref: 'paper',
        x0: 0,
        y0: value,

        x1: 1,
        y1: value,
        yref: 'y',
        line: {
          color: threshold.line.color,
          width: threshold.line.thickness,
          dash: this.getLineDash(threshold.line.type)
        },
      });
    }
  }

  private getLineDash(lineType: string): string {
    switch (lineType) {
      case 'dash':
        return 'dash';

      case 'dot':
        return 'dot';

      case 'linear':
      default:
        return 'solid';
    }
  }

  private setTimeSeries(): void {
    this.logger.debug('setTimeSeries');
    this.chartData = Object
      .keys(this.widget.config.packetFields)
      .map((fieldId) => {
        return new TimeSeries(this.widget.config.packetFields[fieldId], this.widget.config.fieldAliases[fieldId])
      });
  }

  private async renderBufferedData(): Promise<void> {
    this.logger.debug('renderBufferedData');
    const Plotly = await this.plotly.getPlotly();
    const graph = this.plotly.getInstanceByDivId(
      `widget-${this.widget.id}${this.isToolbarVisible}`
    ); // TODO change isToolbarVisible
    if (graph) {
      if (this.serviceType === ServiceType.OFFLINE) {
        graph.on('plotly_relayout', (eventdata) => {
          if (eventdata['xaxis.range[1]']) {
            this.lastRequestedDate = new Date(eventdata['xaxis.range[1]']);

            this.logger.debug('updateDataRequest');
            this.updateDataRequest();
          }
        });
      }
      this.renderAllSeriesData(this.chartData, Plotly, graph, this.isPaused);
    }
  }

  private convertAndBufferData(packetData: PacketData): void {
    Object.keys(packetData).forEach((key) => {
      if (key !== 'timestamp' && this.chartData.some(({ name }) => name === key)) {
        this.bufferData(
          this.chartData.find(({ name }) => name === key),
          packetData.timestamp,
          packetData[key]
        );
      }
    });
  }

  // OFFLINE
  private dataRequest(): void {
    this.logger.debug('dataRequest');
    if (this.loadingOfflineData || this.dataChannel?.controller.rangeLoaded) {
      return;
    }
    this.logger.debug('dataRequest triggered');
    this.loadingOfflineData = true;

    this.dataService.loadNextData(this.channelId);
  }

  isLoadingData(): boolean {
    if (this.dataChannel?.controller.rangeLoaded) {
      return false;
    }
    return this.dataChannel?.controller.isLoadAllRangeDataRunning
      || this.loadingOfflineData;
  }

  noRangeSelected(): boolean {
    return (
      this.serviceType === ServiceType.OFFLINE &&
      !this.dataService['isRangeSelected']
    );
  }

  private updateDataRequest(): void {
    // Here you ONLY DRAW the trend values into chart
    if (this.widget.config.trend?.trendActive && this.trendValues.length > 0) {
      this.logger.debug('addTrendToChart');
      this.addTrendToChart(this.trend, this.trendValues);
    }

    if (
      !this.lastRequestedDate ||
      !this.lastOfflineDate ||
      this.lastRequestedDate <= this.lastOfflineDate
    ) {
      return;
    }

    this.dataRequest();
  }

  play(): void {
    this.logger.debug('play');
    this.dataChannel.controller.play();
  }

  pause(): void {
    this.logger.debug('pause');
    this.dataChannel.controller.pause();
  }

  onToolbarAction(action: string): void {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
      case 'toolbar:fullscreen':
        widgetAction.value = [...this.allData];
        break;
    }

    this.widgetAction.emit(widgetAction);
  }

}
