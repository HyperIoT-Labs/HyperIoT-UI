import { Component, Injector, Optional, OnInit } from '@angular/core';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { DataChannel, DataPacketFilter, PacketData, LoggerService, Logger } from 'core';
import { PlotlyService } from 'angular-plotly.js';
import { asyncScheduler } from 'rxjs';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './gauge-chart.component.css']
})
export class GaugeChartComponent extends BaseGenericComponent implements OnInit {
  /**
   * DataChannel to subscribe to retrieve data
   */
  dataChannel: DataChannel;
  /**
   * Container for the graph specifics
   */
  graph: any = {};

  /* Fields that are now set statically but will eventually be filled with that from wizard config */
  /**
   * Default gauge value
   */
  value: number = 0;
  /**
   * Max gauge value
   */
  maxValue: number = 100;
  /**
   * Var updated based on the toolbar action selected
   */
  action: string = '';
  /**
   * Field selected in configuration
   */
  field: string;

  protected logger: Logger;
  
  constructor(
    injector: Injector, 
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService,) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(GaugeChartComponent.name);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();
  }

  /**
   * Configures the initial vars and fns necessary to init the data
   */
  configure(): void {
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
    this.field = this.widget.config.packetFields[Object.keys(this.widget.config.packetFields)[0]];

    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      [this.field],
      true
    );
    this.dataChannel = this.dataService.addDataChannel(
      +this.widget.id,
      [dataPacketFilter]
    );
    
    this.dataSubscription = this.dataChannel.subject.subscribe(res => {
      this.computePacketData(res.data);
    });
    
    asyncScheduler.schedule(() => {
      this.setChartLayout();
    })
  }

  /**
   * Compute packetData and buffer it to be structure in the right way and to be passed to renderData
   * @param packetData
   */
  computePacketData(packetData: PacketData[]) {
    super.computePacketData(packetData);
    this.logger.debug('computePacketData -> packetData: ', packetData);
    packetData.forEach(datum => this.renderData(datum[this.field]));
  }

  /**
   * Adds new data to the chart
   * The commented part is left there in case we'll want to add the arrow indicator
   * @param packetData
   */
  async renderData(data: number) {
    const Plotly = await this.plotly.getPlotly();
    const graph = this.plotly.getInstanceByDivId(`widget-${this.widget.id}${this.isToolbarVisible}`);
    if (graph) {
      this.value = data;
      this.logger.debug('renderData -> data to add: ', this.value);
      // The next 3 lines are used to insert the arrow indicator that points to the current value on the gauge chart
      // APPROVE NEEDED
      /* const height = graph.offsetHeight; 
      const width = graph.offsetWidth;
      this.calculateIndicatorAndLayout(height, width); */
      Plotly.update(graph, { 
        value: this.value, number: { valueformat: "." }, 
        gauge: { axis: { range: [null, this.maxValue], tickwidth: 1, tickcolor: this.widget.config.textColor }, bar: { color: this.widget.config.textColor }} 
      }, this.graph.layout);
    }
  }

  /**
   * Init the chart structure and data
   */
  setChartLayout() {
    this.graph.data.push(
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: this.value,
        number: { font: { size: 40 }, valueformat: "." },
        title: { text: this.field.charAt(0).toUpperCase() + this.field.slice(1), font: { size: 20 }},
        type: "indicator",
        mode: "gauge+number",
        gauge: { 
          axis: { range: [0, this.maxValue], tickwidth: 1, tickcolor: this.widget.config.textColor },
          bar: { color: this.widget.config.textColor },
        }
      }
    );
    
    this.graph.layout = {
      font: { color: this.widget.config.textColor, family: "Exo" },
      xaxis: {showgrid: false, automargin: true, 'zeroline': false, 'visible': false},
      yaxis: { showgrid: false, automargin: true, 'zeroline': false, 'visible': false},
      showlegend: false,
      autosize: true,
      margin: { autoexpand: true, t: 35, b: 5, l: 35, r: 35 }
    };
    this.graph.config = { responsive: true };
    this.isConfigured = true;
    
    /* Init ResizeObserver if the widget is being init on fullscreen */
    if(document.getElementById('container-widget-fullscreen')) {
      this.observeResize();
    }
  }

  /**
   * On screen resize update the value format on the chart
   */
  async observeResize() {
    const Plotly = await this.plotly.getPlotly();
    const container = document.getElementById('container-widget-fullscreen');
    const resizeObserver = new ResizeObserver(() => {
      const fullScreenGraph = this.plotly.getInstanceByDivId(`widget-${this.widget.id}${this.isToolbarVisible}`);
      if (fullScreenGraph) Plotly.update(fullScreenGraph, { number: { valueformat: "." } });
    });

    resizeObserver.observe(container);
  }

  /**
   * Function that calculates the necessary measures to insert the Arrow Indicator
   * @param height 
   * @param width 
   */
  calculateIndicatorAndLayout(height: number, width: number) {
    let rx = 0.72;
    let ry = 0.72;
    if (width > 450) {
      rx = width/100 * 3.3 / 100;
    }
    function degToRad(deg: number) {
      return deg * (Math.PI / 180);
    }
    const xHead = Math.cos(degToRad(180 - this.value * (180 /this.maxValue))) * rx;
    const yHead = Math.sin(degToRad(180 - this.value * (180 /this.maxValue))) * ry;

    this.graph.layout = {
      margin: { t: 75, r: 35, l: 35, b: 35 },
      font: { color: this.widget.config.textColor, family: "Exo" },
      xaxis: {range: [-1, 1], showgrid: false, 'zeroline': false, 'visible': false},
      yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
      showlegend: false,
      annotations: [
        {
          ax: 0,
          ay: 0,
          axref: 'x',
          ayref: 'y',
          x: xHead,
          y: yHead,
          xref: 'x',
          yref: 'y',
          showarrow: true,
          arrowhead: 9,
        }
      ]
    };
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
    this.action = action;
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
      case 'toolbar:fullscreen':
        widgetAction.value = this.value;
        break;
    }

    this.widgetAction.emit(widgetAction);
  }
}
