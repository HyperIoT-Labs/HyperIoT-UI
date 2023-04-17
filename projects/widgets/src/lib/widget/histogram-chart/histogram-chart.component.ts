import { Component, OnInit, Injector, Optional } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { PlotlyService } from 'angular-plotly.js';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { asyncScheduler, bufferTime, filter, map, merge, skip, take } from 'rxjs';
import { WidgetAction } from '../../base/base-widget/model/widget.model';
import { TimeSeries } from '../../data/time-series';

@Component({
  selector: 'hyperiot-histogram-chart',
  templateUrl: './histogram-chart.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './histogram-chart.component.css']
})
export class HistogramChartComponent extends BaseGenericComponent implements OnInit {
  /**
   * DataChannel to subscribe to retrieve data
   */
  dataChannel: DataChannel;
  /**
   * Contains buffered data
   */
  chartData: TimeSeries[] = [];
  /**
   * Group of packetData
   */
  allData: PacketData[] = [];

  /**
   * Array of fields selected in configuration
   */
  fieldsNames: string[];
  /**
   * Container for the graph specifics
   */
  graph: any = {};
  /**
   * Var updated based on the toolbar action selected
   */
  action: string = '';
  
  //Fields that are now set statically but will eventually be filled with that from wizard config

  /**
   * Color specifics for each trace
   */
  colorSettings: object = {
    temperature: 'red',
    humidity: 'darkblue'
  };
  /**
   * Opacity specifics for each trace
   */
  opacity: number = 0.65;
  /**
   * String used to specify chart display (overlay and stack)
   */
  barmode: string = 'overlay';
  /**
   * Specify if data display should be based on count, sum or avg
   */
  operation: string = 'count';
  // verticalOrientation and categorized cannot be both true at the same time because categories won't work
  /**
   * Regulates the data display which can be horizontal or vertical 
   */
  verticalOrientation: boolean = false;
  /**
   * If true instead of showing the values in the x axis it shows the categories
   */
  categorized: boolean = true;
  /**
   * ValuesAxis and CategoryAxis used to specify axis
   */
  valuesAxis: string = !this.verticalOrientation || this.categorized ? 'y' : 'x';
  categoryAxis: string = 'x';

  protected logger: Logger;
  constructor(
    injector: Injector, 
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(HistogramChartComponent.name);
  }

  ngOnInit() {
    super.ngOnInit();
    this.configure();
  }

  /**
   * Configures the initial vars and fns necessary to init the data
   */
  configure() {
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

    this.graph.layout = {};
    this.graph.data = [];
    this.graph.config = {};
    
    asyncScheduler.schedule(() => {
      this.setTimeSeries();
      this.setChartLayout();
    })
  }

  /**
   * Function called when the component is initialized
   */
  subscribeAndInit() {
    this.subscribeDataChannel();
    this.computePacketData(this.initData);
  }

  /**
   * Subscribe to data channel, use the first data incoming and then the rest after refreshIntervalMillis
   */
  subscribeDataChannel() {
    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );

    this.dataChannel = this.dataService.addDataChannel(
      +this.widget.id,
      [dataPacketFilter]
    );

    const firstElement = this.dataChannel.subject.pipe(
      map(dataChunk => dataChunk.data),
      bufferTime(0.1),
      take(1),
      filter((data) => data.length !== 0),
      map(data => [].concat.apply([], data) as PacketData[])
    );

    const followingElements = this.dataChannel.subject.pipe(
      map(dataChunk => dataChunk.data),
      skip(1),
      bufferTime(this.widget.config.refreshIntervalMillis || 0),
      filter((data) => data.length !== 0),
      map(data => [].concat.apply([], data) as PacketData[])
    );
    
    this.dataSubscription = merge(firstElement, followingElements).subscribe( eventData => this.computePacketData(eventData));
    
  }

  /**
   * Compute packetData and buffer it to be structure in the right way and to be passed to renderData
   * @param packetData: PacketData[]
   */
  computePacketData(packetData: PacketData[]) {
    this.logger.debug('computePacketData -> packetData: ', packetData);
    super.computePacketData(packetData);
    if (packetData.length === 0) {
      return;
    }
    this.allData = this.allData.concat(packetData);
    packetData.forEach(datum => {
      this.convertAndBufferData(datum);
    });
    this.renderData(packetData);
  }

  /**
   * Converts and buffers the element data
   * @param element: Object
   */
  convertAndBufferData(element: object) {
    Object.keys(element).forEach((k) => {
      if (this.chartData.some((x) => x.name === k)) {
        this.bufferData(
          this.chartData.find((x) => x.name === k),
          element['timestamp-default'],
          element[k]
        );
      }
    });
  }
  /**
   * Create timeSeries based on package field
   */
  setTimeSeries(): void {
    Object.keys(this.widget.config.packetFields).forEach((fieldId) => {
      this.chartData.push(
        new TimeSeries(this.widget.config.packetFields[fieldId])
      );
    });
  }

  /**
   * Adds the incoming data to the chart
   * If the chart has just been initialized and has not data
   * It will be updated else data will be added to it
   * @param packetData
   */
  async renderData(packetData: PacketData) {
    const Plotly = await this.plotly.getPlotly();
    const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}${this.isToolbarVisible}`);
    let data = {};
    try {
      this.logger.debug('renderData: packetData: ', packetData);
      this.logger.debug('renderData: graph data status before updating or extending traces: ', graph.data);
      if (graph) {
        if (graph.data[0].x && graph.data[0].x.length > 0 || graph.data[0].y && graph.data[0].y.length > 0) {
          // Adding new data to exisisting chart
          packetData.forEach((pack) => {
            Object.keys(pack).forEach((k) => {
              if (Object.values(this.widget.config.packetFields).find(val => val === k)) {
                data = {};
                data[this.valuesAxis] = [[pack[k]]];
                if (!this.verticalOrientation && this.categorized) { data[this.categoryAxis] = [[this.firstLetterUpperCase(k)]]}
                Plotly.extendTraces(graph, data, [graph.data.indexOf(graph.data.find((el) => el.name.toLowerCase() == k))]);
              }
            })
          })
        } else {
          // Adding data to empty chart
          packetData.forEach((pack) => {
            Object.keys(pack).forEach((k) => {
              if (Object.values(this.widget.config.packetFields).find(val => val === k)) {
                let trace = graph.data.find(trace => trace.name.toLowerCase() == k);
                let index = graph.data.indexOf(trace);
                data = { ...graph.data };
                data[index][this.valuesAxis].push(pack[k]);
                if (!this.verticalOrientation && this.categorized) { data[index][this.categoryAxis].push(this.firstLetterUpperCase(trace.name)) }
              }
            })
          });
          Plotly.react(graph, data);
        }
      }
    } catch(e) {
      this.logger.error('renderData impossible to add data to chart', e);
    }
  }

  /**
   * Init the chart with no data
   */
  setChartLayout() {    
    let trace: any = {};
    Object.values(this.widget.config.packetFields).forEach((field: string) => {
      trace =
      {
        type: 'histogram',
        histfunc: this.operation,
        name:  this.firstLetterUpperCase(field),
        marker: {
          color: this.colorSettings[Object.keys(this.colorSettings).find((k) => k === field)]
        },
        opacity: this.opacity
      };
      trace[this.valuesAxis] = [];
      if (!this.verticalOrientation && this.categorized) { trace[this.categoryAxis] = [this.firstLetterUpperCase(field)] };
      this.graph.data.push(trace);
    });
    let title = '';
    Object.values(this.widget.config.packetFields).forEach((field: string) => {
      title = title.concat( Object.values(this.widget.config.packetFields).indexOf(field) !== 0 ? ' - '
        : '' , this.firstLetterUpperCase(field));
    });
    this.graph.layout = {
      font: { color: "darkblue", family: "Exo" },
      title: title,
      showlegend: false,
      xaxis: { range: [0, null], title: this.categorized ? '' : $localize`:@@HYT_value:Value`, 'visible': true},
      yaxis: { range: [0, null], title: this.firstLetterUpperCase(this.operation), 'visible': true},
      margin: { t: 55, r: 35, l: 55, b: 45 }
    };
    if (this.barmode !== '') { this.graph.layout['barmode'] = this.barmode }
    this.graph.config = { responsive: true };
    this.logger.debug('graph initial status: ', this.graph);
  }

  /**
   * Format the string to have the first letter capitalized
   * @param string
   * @returns formatted string
   */
  firstLetterUpperCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  /**
   * Called when the play button from the toolbar is pressed
   * Unpauses the data channel stream
   */
  play(): void {
    this.dataChannel.controller.play();
  }

  /**
   * Called when the pause button from the toolbar is pressed
   * Pauses the data channel stream
   */
  pause(): void {
    this.dataChannel.controller.pause();
  }

  /**
   * Called when one of the toolbar options is pressed and emits the correct event
   * @param action 
   */
  onToolbarAction(action: string) {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
      case 'toolbar:fullscreen':
        widgetAction.value = this.allData;
        break;
    }
    this.widgetAction.emit(widgetAction);
  }
}