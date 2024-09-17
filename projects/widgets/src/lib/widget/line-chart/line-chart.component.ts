import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from "@angular/core";
import {
  DataChannel,
  DataPacketFilter,
  Logger,
  LoggerService,
  PacketData,
} from "core";
import { PlotlyComponent, PlotlyService } from "angular-plotly.js";
import {
  Subscription,
  asyncScheduler,
  bufferTime,
  filter,
  map,
} from "rxjs";

import { BaseChartComponent } from "../../base/base-chart/base-chart.component";
import { ConfigButtonWidget, WidgetAction } from "../../base/base-widget/model/widget.model";
import { TimeSeries } from "../../data/time-series";
import { ServiceType } from "../../service/model/service-type";
import { DashboardEventService } from "../../dashboard/services/dashboard-event.service";
import { DashboardEvent } from "../../dashboard/services/dashboard-event.model";

@Component({
  selector: "hyperiot-line-chart",
  templateUrl: "./line-chart.component.html",
  styleUrls: [
    "../../../../../../src/assets/widgets/styles/widget-commons.css",
    "./line-chart.component.css",
  ],
})
export class LineChartComponent extends BaseChartComponent implements OnInit {
  @ViewChild("lineChartPlotly") lineChartPlotly: PlotlyComponent;
  lowerBound = 0;
  sideMarginGap = 0.12;
  totalLength = 0;
  fieldsName: any[] = [];
  get initToolbarConfig(): ConfigButtonWidget {
    return {
      showClose: true,
      showSettings: true,
      showPlay: this.serviceType === this.serviceTypeList.ONLINE,
      showRefresh: false,
      showTable: false
    }
  }

  dataChannel: DataChannel;
  dataSubscription: Subscription;
  offControllerSubscription: Subscription;

  lastRequestedDate: Date;
  lastOfflineDate: Date;
  loadingOfflineData = false;

  allData: PacketData[] = [];

  protected logger: Logger;

  private _chartConfig = {
    scrollZoom: true,
    displayModeBar: "hover",
    displaylogo: false,
    modeBarButtonsToRemove: [
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "toggleSpikelines",
      "autoScale2d",
    ],
    modeBarButtonsToAdd: [],
    editable: false,
    showAxisDragHandles: false,
  };

  get chartConfig() {
    return this._chartConfig;
  }

  constructor(
    injector: Injector,
    private dashboardEvent: DashboardEventService,
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService
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
          click: (el) => {
            this.fitToTimeline(plotly, el);
          },
        });
      });

      this.dashboardEvent.timelineEvent.subscribe(async (res) => {
        this.loadingOfflineData = false;
        if (res == DashboardEvent.Timeline.RESET) {
          this.reset();
        }

        if (res == DashboardEvent.Timeline.NEW_RANGE) {
          this.newRange();
        }

        if (res == DashboardEvent.Timeline.REFRESH) {
          this.reset();
          this.newRange();
        }
      });
    }
  }

  async fitToTimeline(plotly?: any, element?: PlotlyComponent) {
    if (!plotly) {
      const plotly = await this.plotly.getPlotly();
      const graph = this.plotly.getInstanceByDivId(
        `widget-${this.widget.id}${this.isToolbarVisible}`
      );

      plotly.relayout(graph, {
        "xaxis.autorange": true,
        "yaxis.autorange": true,
      });
      if (!this.dataChannel.controller.rangeLoaded) {
        this.dataService.loadAllRangeData(this.widget.id);
      }
    } else {
      plotly.relayout(element, {
        "xaxis.autorange": true,
        "yaxis.autorange": true,
      });
      if (!this.dataChannel.controller.rangeLoaded) {
        this.dataService.loadAllRangeData(this.widget.id);
      }
    }
  }

  reset() {
    this.lastOfflineDate = null;
    this.lastRequestedDate = null;
    this.allData = [];
  }

  async newRange() {
    const plotly = await this.plotly.getPlotly();
    const graph = this.plotly.getInstanceByDivId(
      `widget-${this.widget.id}${this.isToolbarVisible}`
    );
    plotly.relayout(graph, {
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    });
  }

  configure() {
    this.graph.layout = {};
    this.graph.data = [];
    super.removeSubscriptionsAndDataChannels();
    if (!this.serviceType) {
      this.logger.error("TYPE SERVICE UNDEFINED");
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

    // scheduling chart initialization because of chart size
    asyncScheduler.schedule(() => {
      this.setTimeSeries();
      this.setTimeChartLayout();
    });
  }

  subscribeAndInit() {
    this.logger.debug("subscribeAndInit");
    this.subscribeDataChannel();
    this.computePacketData(this.initData);

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

  subscribeDataChannel() {
    this.logger.debug("subscribeDataChannel");
    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );
    this.dataChannel = this.dataService.addDataChannel(+this.widget.id, [
      dataPacketFilter,
    ]);
    this.dataSubscription = this.dataChannel.subject
      .pipe(
        map((dataChunk) => dataChunk.data),
        bufferTime(this.widget.config.refreshIntervalMillis || 0),
        filter((data) => data.length !== 0),
        map((data) => [].concat.apply([], data))
      )
      .subscribe((eventData) => this.computePacketData(eventData));
    if (this.serviceType === ServiceType.OFFLINE) {
      this.logger.debug("subscribeAndInit - OFFLINE Service");
      this.offControllerSubscription =
        this.dataChannel.controller.$totalCount.subscribe((res) => {
          this.totalLength = res;
          this.allData = [];
          this.graph.data.forEach((tsd) => {
            (tsd.x = []), (tsd.y = []);
          });
          if (res !== 0) {
            if (this.widget.config.fitToTimeline) {
              this.fitToTimeline();
            } else {
              this.dataRequest();
            }
          }
        });
    }
  }

  computePacketData(packetData: PacketData[]) {
    this.logger.debug("computePacketData", packetData);
    super.computePacketData(packetData);

    if (packetData.length === 0) {
      return;
    }
    this.allData = this.allData.concat(packetData);

    packetData.forEach((datum) => {
      if (
        new Date(datum.timestamp) > this.lastOfflineDate ||
        !this.lastOfflineDate
      ) {
        this.lastOfflineDate = new Date(datum.timestamp);
      }
      this.convertAndBufferData(datum);
    });
    this.renderBufferedData();
    this.loadingOfflineData = false;
    if (this.serviceType === ServiceType.OFFLINE) {
      this.lowerBound++;
      this.updateDataRequest();
    }
  }
  setTimeChartLayout() {
    this.logger.debug("setTimeChartLayout");
    
    // Iterate over chartData to set up the time series data
    this.chartData.forEach((timeSeries, i) => {
      const fieldName = timeSeries.name;
      const a = i + 1;
      
      // Set up the y-axis configuration for each time series
      if (a === 1) {
        this.graph.layout[`yaxis`] = {
          title: fieldName,
          domain: [0.15, 0.85],
        };
      } else {
        this.graph.layout[`yaxis${a}`] = {
          title: fieldName,
          autorange: true,
          anchor: "free",
          overlaying: "y",
          side: "right",
          position: 1 - i * this.sideMarginGap,
        };
      }
  
      // Add time series data (empty x, y values for now)
      const tsd = {
        name: fieldName,
        x: [],
        y: [],
        yaxis: "y" + (i + 1),
        type: "",
      };
      Object.assign(tsd, this.defaultSeriesConfig);
      this.graph.data.push(tsd);
    });
  
    // Add the threshold line(s)
    const thresholdValue1 = 50;
    const thresholdValue2 = 80;
  
    // Use layout.shapes to add horizontal lines at the threshold values
    this.graph.layout.shapes = [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: thresholdValue1,
        y1: thresholdValue1,
        line: {
          color: "red",
          width: 2,
          dash: "dashdot",
        },
      },
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: thresholdValue2,
        y1: thresholdValue2,
        line: {
          color: "red",
          width: 2,
          dash: "dashdot",
        },
      },
      {
        type: "rect",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: thresholdValue1,
        y1: thresholdValue2,
        fillcolor: "rgba(255, 0, 0, 0.2)",
        opacity: 0.5,
        line: {
          width: 0,
        },
      }
    ];
  
    // Set up legend and other layout settings
    this.graph.layout.showlegend = true;
    this.graph.layout.legend = {
      orientation: "h",
      x: 0.25,
      y: 1,
      traceorder: "normal",
      font: {
        family: "sans-serif",
        size: 10,
        color: "#000",
      },
      bgcolor: "#FFFFFF85",
      borderwidth: 0,
    };
  
    this.graph.layout.font = {
      size: 9,
    };
    this.graph.layout.title = null;
    this.graph.layout.dragmode = "pan";
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
      type: "date",
      showgrid: false,
      range: [],
    };
  }
  

  setTimeSeries(): void {
    this.logger.debug("setTimeSeries");
    this.chartData = [];
    Object.keys(this.widget.config.packetFields).forEach((fieldId) => {
      this.chartData.push(
        new TimeSeries(this.widget.config.packetFields[fieldId])
      );
    });
  }

  async renderBufferedData() {
    this.logger.debug("renderBufferedData");
    const Plotly = await this.plotly.getPlotly();
    const graph = this.plotly.getInstanceByDivId(
      `widget-${this.widget.id}${this.isToolbarVisible}`
    ); // TODO change isToolbarVisible
    if (graph) {
      if (this.serviceType === ServiceType.OFFLINE) {
        graph.on("plotly_relayout", (eventdata) => {
          if (eventdata["xaxis.range[1]"]) {
            this.lastRequestedDate = new Date(eventdata["xaxis.range[1]"]);
            this.updateDataRequest();
          }
        });
      }
      this.renderAllSeriesData(this.chartData, Plotly, graph, this.isPaused);
    }
  }

  convertAndBufferData(ed: PacketData) {
    this.logger.debug("convertAndBufferData");
    Object.keys(ed).forEach((k) => {
      if (k !== "timestamp") {
        if (this.chartData.some((x) => x.name === k)) {
          this.bufferData(
            this.chartData.find((x) => x.name === k),
            ed.timestamp,
            ed[k]
          );
        }
      }
    });
  }

  // OFFLINE
  dataRequest() {
    this.logger.debug("dataRequest");
    if (this.loadingOfflineData || this.dataChannel?.controller.rangeLoaded) {
      return;
    }
    this.logger.debug("dataRequest triggered");
    this.loadingOfflineData = true;

    this.dataService.loadNextData(this.widget.id);
  }

  isLoadingData() {
    if (this.dataChannel?.controller.rangeLoaded) {
      return false;
    }
    return (
      this.dataChannel?.controller.isLoadAllRangeDataRunning ||
      this.loadingOfflineData
    );
  }

  noRangeSelected() {
    return (
      this.serviceType === ServiceType.OFFLINE &&
      !this.dataService["isRangeSelected"]
    );
  }

  updateDataRequest() {
    this.logger.debug("updateDataRequest");
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
    this.logger.debug("play");
    this.dataChannel.controller.play();
  }

  pause(): void {
    this.logger.debug("pause");
    this.dataChannel.controller.pause();
  }

  onToolbarAction(action: string) {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case "toolbar:play":
        this.play();
        break;
      case "toolbar:pause":
        this.pause();
        break;
      case "toolbar:fullscreen":
        widgetAction.value = this.allData;
        break;
    }

    this.widgetAction.emit(widgetAction);
  }
}
