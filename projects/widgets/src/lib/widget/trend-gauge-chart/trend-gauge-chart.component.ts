import { Component, Injector, OnDestroy, OnInit, Optional } from '@angular/core';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { PlotlyService } from 'angular-plotly.js';
import { LoggerService, Logger, DataChannel, DataPacketFilter, PacketData } from 'core';
import { asyncScheduler, bufferTime, concatMap, filter, map, reduce, scan, startWith, Subject, Subscription, switchMap, withLatestFrom } from 'rxjs';
import { WidgetAction } from '../../base/base-widget/model/widget.model';
import { linearRegression } from 'simple-statistics';
import { DashboardEventService } from '../../dashboard/services/dashboard-event.service';
import { ServiceType } from "../../service/model/service-type";
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'hyperiot-trend-gauge-chart',
  templateUrl: './trend-gauge-chart.component.html',
  styleUrls: [
    '../../../../../../src/assets/widgets/styles/widget-commons.css',
    './trend-gauge-chart.component.css'
  ],
  providers: [
    DecimalPipe
  ]
})
export class TrendGaugeChartComponent extends BaseGenericComponent implements OnInit, OnDestroy {

  /**
   * Container for the graph specifics
   */
  graph: any = {};

  loadingOfflineData = false;

  /**
   * DataChannel to subscribe to retrieve data
   */
  private dataChannel: DataChannel;

  /**
   * Field selected in configuration
  */
  private field: string;

  private labelField: string;

  private channelId: number;

  private offControllerSubscription: Subscription;

  get plotlyInstance() {
    return this.plotly.getInstanceByDivId(`widget-${this.widget.id}${this.isToolbarVisible}`);
  }

  readonly gauge = {
    axis: {
      range: [-1, 1],
      tickcolor: 'black'
    },
    bar: {
      color: 'transparent',
    },
    bgcolor: 'white',
    bordercolor: 'black',
    borderwidth: 2,
    steps: [],
    threshold: {
      line: {
        color: 'blue',
        width: 4
      },
      thickness: 0.75,
      value: undefined
    }
  };

  private lastValue: string;

  protected logger: Logger;

  readonly accumulator = [];

  constructor(
    injector: Injector,
    public plotly: PlotlyService,
    private dashboardEvent: DashboardEventService,
    private decimalPipe: DecimalPipe,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.configure();

    this.dashboardEvent.timelineEvent
      .subscribe({
        next: async (res) => {
          this.loadingOfflineData = false;
          await this.reset();
        }
      })
  }

  ngOnDestroy(): void {
    this.offControllerSubscription?.unsubscribe();

    this.dataSubscription?.unsubscribe();
    this.dataService?.removeDataChannel(this.channelId);

    this.ngOnDestroy();
  }

  private async reset(): Promise<void> {
    this.lastValue = undefined;
    this.accumulator.length = 0;
    await this.renderData(this.lastValue);
  }

  /**
   * Configures the initial vars and fns necessary to init the data
   */
  configure(): void {
    this.graph.layout = {};
    this.graph.data = [];
    this.graph.config = {};

    super.removeSubscriptionsAndDataChannels();

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

    super.configure();

    asyncScheduler.schedule(() => {
      this.setChartLayout();
    });

    const hPacketFieldId = Object.keys(this.widget.config.packetFields)[0];
    this.field = this.widget.config.packetFields[hPacketFieldId];
    this.labelField = this.widget.config.fieldAliases[hPacketFieldId] || this.widget.config.packetFields[hPacketFieldId];
  }

  /**
   * Compute packetData and buffer it to be structure in the right way and to be passed to renderData
   * @param packetData
   */
  async computePacketData(packetData: PacketData[]) {
    this.logger.debug('computePacketData -> packetData: ', packetData);

    const value = this.slope([...packetData]);

    await this.renderData(value);
  }

  /**
   * Slope in mathematics refers to the measure of the steepness or incline of a line
   */
  private slope(packetData: PacketData[]): number {
    const regressionData = packetData
      .map((datum, index) => [
        index,
        parseFloat(datum[this.field])
      ]);

    const lr = linearRegression(regressionData);
    return lr.m;
  }

  /**
   * Adds new data to the chart
   * The commented part is left there in case we'll want to add the arrow indicator
   * @param packetData
   */
  private async renderData(value: number | string): Promise<void> {
    const graph = this.plotlyInstance;
    if (graph) {
      const Plotly = await this.plotly.getPlotly();

      if (typeof value === 'number') {
        let currentValue = value;
        let symbol = '';
        if (value === Infinity || value > 1) {
          currentValue = 1;
          symbol = '> ';
        } else if (value === -Infinity || value < -1) {
          currentValue = -1;
          symbol = '< ';
        }

        this.lastValue = symbol + this.decimalPipe.transform(currentValue, '1.1-2');
        if (this.lastValue === 'null') {
          this.lastValue = 'ND';
        }
      } else {
        this.lastValue = value ? value : 'ND';
      }

      const gauge = this.gauge;
      gauge.threshold.value = value;

      Plotly.update(
        graph,
        {
          gauge
        },
        this.graph.layout
      );

      const oldValueOnlyNumber = graph.querySelector(".indicatorlayer .numbers text");
      if (oldValueOnlyNumber) {
        oldValueOnlyNumber.textContent = this.lastValue;
      }
    }
  }

  /**
   * Init the chart structure and data
   */
  private setChartLayout(): void {
    this.graph.data.push({
      type: 'indicator',
      mode: 'gauge+number',
      value: undefined,
      title: {
        text: (() => {
          const title = this.labelField;
          return title.charAt(0).toUpperCase() + title.slice(1);
        })(),
        font: {
          size: this.widget.config.title.fontSize
        },
      },
      gauge: (() => {
        const gauge = this.gauge;

        gauge.steps = this.widget.config.steps;
        gauge.threshold.value = undefined;

        return gauge;
      })()
    });

    this.graph.layout = {
      font: {
        color: this.widget.config.textColor,
        family: 'Exo'
      },
      showlegend: false,
      autosize: true,
      margin: {
        autoexpand: true,
        t: 35,
        b: 5,
        l: 35,
        r: 35
      }
    };

    this.graph.config = {
      responsive: true
    };
  }

  /**
   * Called when the play button from the toolbar is pressed
   * Unpauses the data channel stream
   */
  private play(): void {
    this.dataChannel.controller.play();
  }

  /**
   * Called when the pause button from the toolbar is pressed
   * Pauses the data channel stream
   */
  private pause(): void {
    this.dataChannel.controller.pause();
  }

  onChartInitialized(): void {
    this.subscribeDataChannel();

    const resizeObserver = new ResizeObserver((entries) => {
      const graph = this.plotlyInstance;
      if (graph) {
        this.plotly.resize(graph);

        setTimeout(() => {
          const oldValueOnlyNumber = graph.querySelector(".indicatorlayer .numbers text");
          if (oldValueOnlyNumber) {
            oldValueOnlyNumber.textContent = this.lastValue;
          }
        }, 100);
      }
    });

    resizeObserver.observe(this.plotlyInstance);
  }

  private subscribeDataChannel(): void {
    this.logger.debug("subscribeDataChannel");

    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );

    this.channelId = +this.widget.id;

    if (!this.isToolbarVisible && this.serviceType === ServiceType.OFFLINE) {
      // setting negative id to fullscreen offline widget channel to prevent updating original widget
      // TODO channelId should be a proper string
      this.channelId = -this.channelId;
      this.dataChannel = this.dataService.copyDataChannel(this.channelId, -this.channelId);
    } else {
      this.dataChannel = this.dataService.addDataChannel(this.channelId, [dataPacketFilter]);
    }

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

            const filtered = this.accumulator.filter((datum) => datum?.[this.field]);
            await this.computePacketData(filtered);

            this.accumulator.length = 0;
          }
        }
      });

    if (this.serviceType === ServiceType.OFFLINE) {
      this.logger.debug("subscribeAndInit - OFFLINE Service");
      this.offControllerSubscription = this.dataChannel.controller.$totalCount
        .subscribe({
          next: async (res: number) => {
            if (this.isToolbarVisible) {
              if (res > 0) {
                this.dataService.loadAllRangeData(this.channelId);
              } else {
                await this.renderData(undefined);
              }
            } else { // if fullscreen
              await this.renderData(this.initData);
            }
          }
        });
    }
  }


  /**
   * Called when one of the toolbar options is pressed and emits the correct event
   * @param action
   */
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
        widgetAction.value = this.lastValue;
        break;
    }

    this.widgetAction.emit(widgetAction);
  }

  noRangeSelected() {
    return (
      this.serviceType === ServiceType.OFFLINE &&
      !this.dataService["isRangeSelected"]
    );
  }

}
