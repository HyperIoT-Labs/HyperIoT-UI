import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData, PacketDataChunk } from 'core';
import {
  Subject,
  asyncScheduler,
  filter,
  map,
  bufferTime
} from 'rxjs';
import { BaseTableComponent } from '../../base/base-table/base-table.component';
import { PlotlyService } from 'angular-plotly.js';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-defibrillator',
  templateUrl: './defibrillator.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './defibrillator.component.scss'],
})
export class DefibrillatorComponent extends BaseTableComponent implements OnInit {
  allData$: Subject<any[]> = new Subject();
  isPaused = false;

  timestamp: string = '';
  packetFields: Array<string> = [];
  defibrillatorKeys: Array<any> = [];
  allData: any[] = [];

  sensorFields: object = {};
  sensorFieldWidth: number;

  protected dataChannel: DataChannel;
  graphsList: Array<any> = [];

  parameters = {
    ecg: {
      value: 0,
      source: ''
    },
    resp: {
      value: 0,
      source: ''
    },
    spo2: {
      value: 0,
      source: ''
    },
    temp: {
      value: 0,
      source: ''
    },
    pr: {
      value: 0,
      source: ''
    },
    nibp: {
      value: 0,
      source: ''
    },
  };

  graphs = {
    standard: {
      chart0: {
        chart: { },
        source: '',
        index: 0
      },
      chart1: {
        chart: { },
        source: '',
        index: 1
      },
      chart2: {
        chart: { },
        source: '',
        index: 2
      },
      chart3: {
        chart: { },
        source: '',
        index: 3
      }
    },
    derivations: []
  };

  protected logger: Logger;

  derivationsGridLayout;

  derivationsTitleMap = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  constructor(
    injector: Injector,
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(DefibrillatorComponent.name);
  }

  ngOnInit(): void {
    this.logger.debug(this.widget.name);
    super.ngOnInit();

    asyncScheduler.schedule(() => {
      this.configure();
    });
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    // reset derivations graphs
    this.graphs.derivations = [];
    if (this.widget.config && this.widget.config?.packetFields) {
      this.packetFields = Object.values(this.widget.config?.packetFields);
    }
    if (
      !(
        this.widget.config != null
      )
    ) {
      this.isConfigured = false;
      return;
    }
    this.isConfigured = true;
    this.graphsList = [];
    this.sensorFields = [];
    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
      return;
    }

    super.configure();

    this.derivationsGridLayout = this.widget.config.internalConfig.derivationsGridLayout;

    asyncScheduler.schedule(() => {
      const dataPacketFilterList: DataPacketFilter[] = [];

      if (this.widget.config.internalConfig.visualizationType === 'standard') {

        // setting standard chart area 1
        this.widget.config.defibrillator.standardArea1.types.forEach((x, i) => {
          const type = this.widget.config.defibrillator.standardArea1.types[i];
          const packetField = this.widget.config.defibrillator.standardArea1.packetField[i];
          const color = this.widget.config.defibrillator.standardArea1.colors[i];

          if (dataPacketFilterList.some(dpf => dpf.packetId === packetField.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packetField.packetId);
            if (!currentPacketFilter.fields.includes(packetField.name)) {
              currentPacketFilter.fields.push(packetField.name);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              packetField.packetId,
              [packetField.name],
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }

          // TODO define settings with object, not array
          this.graphs.standard['chart' + i] = {
            chart: { },
            source: packetField.packetId + ':' + packetField.name
          };

          let title = '';
          if (type === 'ecg') {
            title = i === 0 ? 'II' : 'I';
          } else if (type === 'spo2') {
            title = 'pleth';
          } else {
            title = type;
          }
          this.setDefaultChartLayout('chart' + i, this.graphs.standard['chart' + i].chart, type, color, title);

        });

      } else if (this.widget.config.internalConfig.visualizationType === 'derivations') {
        // setting derivations chart area

        this.widget.config.defibrillator.derivations.packetField.forEach((pckt, i) => {
          const type = 'ecg';
          const packetField = this.widget.config.defibrillator.derivations.packetField[i];
          const color = '#32CD32';

          if (dataPacketFilterList.some(dpf => dpf.packetId === packetField.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packetField.packetId);
            if (!currentPacketFilter.fields.includes(packetField.name)) {
              currentPacketFilter.fields.push(packetField.name);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              packetField.packetId,
              [packetField.name],
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }

          this.graphs.derivations.push({chart: { }, source: pckt.packetId + ':' + pckt.name});
          this.setDefaultChartLayout('chart' + i, this.graphs.derivations[i].chart, type, color, this.derivationsTitleMap[i]);

        });

      }

      // setting standard chart area 1 parameters
      let parametersPacketFields;
      if (this.widget.config.defibrillator.standardArea1.parametersPacketField) {
        parametersPacketFields = this.widget.config.defibrillator.standardArea1.parametersPacketField;
      } else {
        parametersPacketFields = null;
      }
      Object.keys(parametersPacketFields).forEach(x => {
        const packet = parametersPacketFields[x];
        if (dataPacketFilterList.some(dpf => dpf.packetId === packet.packetId)) {
          const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packet.packetId);
          if (!currentPacketFilter.fields.includes(packet.name)) {
            currentPacketFilter.fields.push(packet.name);
          }
        } else {
          const dataPacketFilter = new DataPacketFilter(
            packet.packetId,
            [packet.name],
            true
          );
          dataPacketFilterList.push(dataPacketFilter);
        }

        this.parameters[x].source = packet.packetId + ':' + packet.name;
      });

      // setting standard parameters area 2
      // this.widget.config.defibrillator.standardArea2.types.forEach((x, i) => {
      //   const type = this.widget.config.defibrillator.standardArea2.types[i];
      //   const packetField = this.widget.config.defibrillator.standardArea2.packetField[i];
      //   const color = this.widget.config.defibrillator.standardArea2.colors[i];

      //   if (dataPacketFilterList.some(dpf => dpf.packetId === packetField.packetId)) {
      //     const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packetField.packetId);
      //     if (!currentPacketFilter.fields.includes(packetField.name)) {
      //       currentPacketFilter.fields.push(packetField.name);
      //     }
      //   } else {
      //     const dataPacketFilter = new DataPacketFilter(
      //       packetField.packetId,
      //       [packetField.name],
      //       true
      //     );
      //     dataPacketFilterList.push(dataPacketFilter);
      //   }

      //   this.parameters[type].source = packetField.packetId + ':' + packetField.name;
      // });

      // // setting standard parameters area 3
      // this.widget.config.defibrillator.standardArea2.types.forEach((x, i) => {
      //   const type = this.widget.config.defibrillator.standardArea3.types[i];
      //   const packetField = this.widget.config.defibrillator.standardArea3.packetField[i];
      //   const color = this.widget.config.defibrillator.standardArea3.colors[i];

      //   if (dataPacketFilterList.some(dpf => dpf.packetId === packetField.packetId)) {
      //     const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packetField.packetId);
      //     if (!currentPacketFilter.fields.includes(packetField.name)) {
      //       currentPacketFilter.fields.push(packetField.name);
      //     }
      //   } else {
      //     const dataPacketFilter = new DataPacketFilter(
      //       packetField.packetId,
      //       [packetField.name],
      //       true
      //     );
      //     dataPacketFilterList.push(dataPacketFilter);
      //   }

      //   // this.parameters[type].source = packetField.packetId + ':' + packetField.name;
      // });

      this.subscribeAndInit(dataPacketFilterList);

    });

  }

  subscribeAndInit(dataPacketFilterList: DataPacketFilter[]) {
    this.dataChannel = this.dataService.addDataChannel(+this.widget.id, dataPacketFilterList);
    this.dataSubscription = this.dataChannel.subject
      .pipe(
        // map(dataChunk => dataChunk.data),
        bufferTime(this.widget.config.internalConfig.dataFrequency * 1000 || 500),
        // bufferTime(this.widget.config.refreshIntervalMillis || 0),
        filter((data) => data.length !== 0),
        map(data => [].concat.apply([], data)))
      .subscribe((eventData) => {
        const aggregation: PacketDataChunk[] = [];
        eventData.forEach(element => {
          if (aggregation.some(x => x.packetId === element.packetId)) {
            const dataAggregation = aggregation.find(x => x.packetId === element.packetId);
            dataAggregation.data = dataAggregation.data.concat(element.data);
          } else {
            aggregation.push(element);
          }
        });
        aggregation.forEach(a => this.computePacketDataMP(a.data, a.packetId));
      });

    // this.computePacketData(this.initData);
  }

  computePacketDataMP(packetData: PacketData[], packetId: number) {

    Object.keys(packetData[0]).forEach(fieldName => {
      if (fieldName === 'timestamp') {
        return;
      }

      // updateing standard charts
      if (this.widget.config.internalConfig.visualizationType === 'standard') {
        const chartsToUpdate = Object.values(this.graphs.standard).filter((x: any) => x.source === packetId + ':' + fieldName) as any;

        chartsToUpdate.forEach(chart => {
          const defibrillatorElements = packetData.map(pd => ({ timestamp: pd.timestamp, trace: chart.chart.key, value: pd[fieldName] }));
          this.renderData(chart.chart.key, defibrillatorElements);
        });
      }

      // code for derivations
      if (this.widget.config.internalConfig.visualizationType === 'derivations') {
        const derChartsToUpdate = this.graphs.derivations.filter((x: any) => x.source === packetId + ':' + fieldName) as any;

        derChartsToUpdate.forEach(chart => {
          const defibrillatorElements = packetData.map(pd => ({ timestamp: pd.timestamp, trace: chart.chart.key, value: pd[fieldName] }));
          this.renderData(chart.chart.key, defibrillatorElements);
        });
      }

      // updateing parameters
      const parametersToUpdate = Object.values(this.parameters).filter((x: any) => x.source === packetId + ':' + fieldName) as any;
      parametersToUpdate.forEach(parameter => {
        // passing last value of buffer to parameter
        parameter.value = packetData[packetData.length - 1][fieldName];
      });

    });

  }

  setDefaultChartLayout(field: string, graph, type, color, title) {

    // graph = { };
    graph.key = '';
    graph.data = [];
    graph.layout = [];
    graph.config = {};

    graph.data.name = field;
    graph.data.mode = 'lines';
    if (this.widget.config.colors) {
      graph.data.line = {
        color,
        width: 2,
        shape: type === 'ecg' ? 'linear' : 'spline',
        smoothing: 1.3
      };
    }

    graph.data.type = 'scatter';
    graph.data.connectgaps = true;

    graph.data.marker = {
      colorbar: {
        showticklabels: false
      }
    };

    graph.layout.axis = {
      type: 'date'
    };
    graph.layout.dragmode = false;
    graph.layout.selectdirection = 'h';
    graph.layout.xref = 'paper';
    graph.layout.text = type;
    graph.layout.font = {
      size: 9,
    };
    graph.layout.margin = {
      l: 10,
      r: 10,
      b: 30,
      t: 30,
      pad: 0,
    };
    graph.layout.title = {
      text: title,
      font: {
        color,
        size: 12
      },
      xref: 'paper',
      x: 0
    };
    graph.layout.showarrow = false;
    graph.layout.autosize = true;
    graph.layout.font = {
      size: 16,
      color: 'black'
    };

    graph.layout.autotick = true;
    graph.layout.xaxis = {
      autorange: true,
      showgrid: false,
      visible: false,
      showline: false,
      showticklabels: false
    };
    graph.layout.yaxis = {
      fixedrange: true,
      showgrid: false,
      visible: false,
      showline: false,
      showticklabels: false
    };
    graph.layout.font = {
      size: 16,
      color: 'black'
    };

    // TODO bgColor configuration
    this.widget.config.bgColor = 'dark';
    if (this.widget.config.bgColor === 'dark') {
      graph.layout.plot_bgcolor = 'black';
      graph.layout.paper_bgcolor = 'black';

      graph.layout.modebar = { color: '#d1d1d1'};

      graph.layout.font.color = '#d1d1d1';
    }

    graph.key = field;
    graph.config = {
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: ['toImage', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'pan2d']
    };
    this.graphsList.push(graph);
  }

  async renderData(key: string, elements: any[]) {
    const Plotly = await this.plotly.getPlotly();
    const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-${key}`);
    if (graph) {
      let data = {}
      const currentDate = new Date(elements[elements.length - 1].timestamp);
      if (graph.data && graph.data[0]) {
        data = {};
        data['x'] = [elements.map(x => x.timestamp)];
        data['y'] = [elements.map(x => x.value)];
        Plotly.extendTraces(graph, data, [0]);
        const rangeOne = new Date(currentDate.getTime() - (Number.parseInt(`${this.widget.config.internalConfig.dataRange}000`)));
        Plotly.relayout(graph.id, {
          xaxis: {
            range: [rangeOne, currentDate],
            visible: false
          }
        });
      } else {
        // element.timestamp = currentDate;
        let data = { ...graph.data };
        let layout = { ...graph.layout };
        data['x'] = elements.map(x => x.timestamp);
        data['y'] = elements.map(x => x.value);

        Plotly.react(graph.id, [data], layout);
        const rangeOne = new Date(currentDate.getTime() - (Number.parseInt(`${this.widget.config.internalConfig.dataRange}000`)));
        Plotly.relayout(graph.id, {
          xaxis: {
            range: [rangeOne, currentDate],
            visible: false
          }
        });
      }
    }
  }

  play(): void {
    this.isPaused = false;
    this.dataChannel.controller.play();

    let chartsToUpdate = [];
    if (this.widget.config.internalConfig.visualizationType === 'standard') {
      chartsToUpdate = Object.keys(this.graphs.standard);
    } else if (this.widget.config.internalConfig.visualizationType === 'derivations') {
      chartsToUpdate = this.graphs.derivations;
    }
    chartsToUpdate.forEach(async(x,i) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-chart${i}`);
      graph.layout.dragmode = false;
      Plotly.react(graph.id, graph.data, graph.layout, {
        displaylogo: false,
        responsive: true,
        modeBarButtonsToRemove: ['toImage', 'zoom2d', 'zoomIn2d', 'zoomOut2d','resetScale2d','autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'pan2d']
      });
    });
  }

  pause(): void {
    this.isPaused = true;
    this.dataChannel.controller.pause();

    let chartsToUpdate = [];
    if (this.widget.config.internalConfig.visualizationType === 'standard') {
      chartsToUpdate = Object.keys(this.graphs.standard);
    } else if (this.widget.config.internalConfig.visualizationType === 'derivations') {
      chartsToUpdate = this.graphs.derivations;
    }
    chartsToUpdate.forEach(async(x,i) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-chart${i}`);
      graph.layout.dragmode = 'pan';
      Plotly.react(graph.id, graph.data, graph.layout, {
        displaylogo: false,
        responsive: true,
        modeBarButtonsToRemove: ['toImage', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines']
      });
    });
  }

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
