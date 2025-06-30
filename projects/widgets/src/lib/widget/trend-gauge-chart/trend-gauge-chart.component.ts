import { Component, Injector, OnDestroy, OnInit, Optional } from '@angular/core';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { PlotlyService } from 'angular-plotly.js';
import { LoggerService, Logger, DataChannel, DataPacketFilter, PacketData } from 'core';
import { asyncScheduler, bufferTime, filter, map, Subscription } from 'rxjs';
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
   * DataChannel to subscribe to retrieve data
   */
  private dataChannel: DataChannel;

  /**
   * Container for the graph specifics
   */
  graph: any = {};

  /**
   * Field selected in configuration
   */
  private field: string;

  private labelField: string;

  private channelId: number;

  private offControllerSubscription: Subscription;

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

  loadingOfflineData = false;

  constructor(
    injector: Injector,
    @Optional() public plotly: PlotlyService,
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

    this.dashboardEvent.timelineEvent.subscribe(async (res) => {
      this.loadingOfflineData = false;
      this.reset();
    });
  }

  ngOnDestroy(): void {
    this.offControllerSubscription?.unsubscribe();
  }

  private reset() {
    this.lastValue = undefined;
    this.renderData(this.lastValue);
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
  computePacketData(packetData: PacketData[]) {
    this.logger.debug('computePacketData -> packetData: ', packetData);

    const value = this.slope([...packetData]);

    let currentValue = value;
    if (value === Infinity) {
      currentValue = 1;
    } else if (value === -Infinity) {
      currentValue = -1;
    } else if (value > 1 || value < -1) {
      currentValue = undefined;
    }

    this.lastValue = this.decimalPipe.transform(currentValue, '1.1-1');
    this.renderData(this.lastValue);
  }

  /**
   * Slope in mathematics refers to the measure of the steepness or incline of a line
   */
  private slope(packetData: PacketData[]) {
    const regressionData = packetData.map((datum, index) => [
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
  private async renderData(value: string): Promise<void> {
    const graph = this.plotly.getInstanceByDivId(`widget-${this.widget.id}${this.isToolbarVisible}`);
    if (graph) {
      const Plotly = await this.plotly.getPlotly();

      const gauge = this.gauge;
      gauge.threshold.value = value;

      Plotly.update(
        graph,
        {
          value,
          gauge
        },
        this.graph.layout
      );
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
          const title = this.widget.config.title.text || this.labelField;
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
      xaxis: {
        showgrid: false,
        automargin: true,
        zeroline: false,
        visible: false
      },
      yaxis: {
        showgrid: false,
        automargin: true,
        zeroline: false,
        visible: false
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
      const graph = this.plotly.getInstanceByDivId(
        `widget-${this.widget.id}${this.isToolbarVisible}`
      );

      if (graph) {
        this.plotly.resize(graph);
      }
    });

    resizeObserver.observe(
      document.querySelector(`#widget-${this.widget.id}${this.isToolbarVisible}`)
    );
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
        map((data) => [].concat.apply([], data))
      )
      .subscribe((eventData) => {
        this.loadingOfflineData = false;
        this.computePacketData(eventData);
      });

    if (this.serviceType === ServiceType.OFFLINE) {
      this.logger.debug("subscribeAndInit - OFFLINE Service");
      this.offControllerSubscription =
        this.dataChannel.controller.$totalCount.subscribe((res) => {
          if (this.isToolbarVisible) {
            this.graph.data.forEach((tsd) => {
              (tsd.x = []), (tsd.y = []);
            });

            if (res !== 0) {
              this.dataRequest();
            }
          } else { // if fullscreen   
            this.lastValue = this.initData;         
            this.renderData(this.lastValue);
          }
        });
    }
  }

  // OFFLINE
  private dataRequest(): void {
    this.logger.debug("dataRequest");
    if (this.loadingOfflineData || this.dataChannel?.controller.rangeLoaded) {
      return;
    }
    this.logger.debug("dataRequest triggered");
    this.loadingOfflineData = true;

    this.dataService.loadNextData(this.channelId);
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
