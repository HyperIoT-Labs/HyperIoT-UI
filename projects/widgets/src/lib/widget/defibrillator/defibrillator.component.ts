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
import { KeyValue } from '@angular/common';
import { DefibrillatorSettings } from '../../dashboard/widget-settings-dialog/defibrillator-settings/defibrillator-settings.model';

@Component({
  selector: 'hyperiot-defibrillator',
  templateUrl: './defibrillator.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './defibrillator.component.scss'],
})
export class DefibrillatorComponent extends BaseTableComponent implements OnInit {
  ChannelType = DefibrillatorSettings.Type;
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

  visualizationType;

  parameters = {
    ecgChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    respChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    spo2Channel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    tempChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    prChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    nibpChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    co2Channel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
    ibpChannel: {
      value: 0,
      min: 0,
      max: 0,
      unit: '',
      valueSource: '',
      minSource: '',
      maxSource: '',
      unitSource: '',
    },
  };

  parametersLayout: {
    [key in DefibrillatorSettings.Type]: { color?: string; configured?: boolean };
  } = {
    ECG: { },
    SPO2: { },
    RESP: { },
    PR: { },
    NIBP: { },
    IBP: { },
    CO2: { },
    TEMP: { },
  }

  graphs = {
    summary: {
      chart0: {
        chart: { },
        source: '',
        index: 0
      },
      chart1: {
        chart: { },
        source: '',
        index: 1
      }
    },
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
    derivations: {
      chartI: {
        chart: { },
        source: '',
        index: 0
      },
      chartII: {
        chart: { },
        source: '',
        index: 1
      },
      chartIII: {
        chart: { },
        source: '',
        index: 2
      },
      chartAVR: {
        chart: { },
        source: '',
        index: 3
      },
      chartAVL: {
        chart: { },
        source: '',
        index: 4
      },
      chartAVF: {
        chart: { },
        source: '',
        index: 5
      },
      chartV1: {
        chart: { },
        source: '',
        index: 6
      },
      chartV2: {
        chart: { },
        source: '',
        index: 7
      },
      chartV3: {
        chart: { },
        source: '',
        index: 8
      },
      chartV4: {
        chart: { },
        source: '',
        index: 9
      },
      chartV5: {
        chart: { },
        source: '',
        index: 10
      },
      chartV6: {
        chart: { },
        source: '',
        index: 11
      }
    }
  };

  standardParameters: { type: DefibrillatorSettings.Type; rows: number; }[] = [];

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

    this.visualizationType = this.isToolbarVisible ? 'summary' : 'standard';

    asyncScheduler.schedule(() => {
      this.configure();
    });
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    this.standardParameters = [];
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

    Object.values(this.widget.config.defibrillator.standard.parametersArea1).forEach(channel => {
      this.parametersLayout[channel.type] = {
        color: channel.color,
        configured: !!channel.value,
      }
    });
    Object.values(this.widget.config.defibrillator.standard.standardArea2).forEach(channel => {
      this.parametersLayout[channel.type] = {
        color: channel.color,
        configured: !!channel.value,
      }
    });
    Object.values(this.widget.config.defibrillator.standard.standardArea3).forEach(channel => {
      this.parametersLayout[channel.type] = {
        color: channel.color,
        configured: !!channel.value,
      }
    });

    Object.values(this.widget.config.defibrillator.standard.standardArea1).forEach(channel => {
      if (!channel.type) {
        return;
      }
      const sp = this.standardParameters.find(sp => sp.type === channel.type);
      if (sp) {
        sp.rows ++;
      } else {
        this.standardParameters.push({
          type: channel.type,
          rows: 1,
        });
      }
    });

    asyncScheduler.schedule(() => {
      const dataPacketFilterList: DataPacketFilter[] = [];

      if (this.visualizationType === 'summary') {
        // setting summary charts
        [
          this.widget.config.defibrillator.standard.standardArea1.channel1,
          this.widget.config.defibrillator.standard.standardArea1.channel2,
        ].forEach((channel, i) => {
          if (!channel.type || !channel.value) {
            return;
          }
          const type = channel.type;
          const valuePacketField = channel.value;
          const color = channel.color;

          if (dataPacketFilterList.some(dpf => dpf.packetId === valuePacketField.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === valuePacketField.packetId);
            if (!currentPacketFilter.fields[valuePacketField.id]) {
              Object.assign(currentPacketFilter.fields, valuePacketField.fieldSequence);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              valuePacketField.packetId,
              valuePacketField.fieldSequence,
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }

          this.graphs.summary['chart' + i] = {
            chart: { },
            source: valuePacketField.packetId + ':' + valuePacketField.fieldSequence[valuePacketField.id]
          };
          let title = i === 0 ? 'II' : 'I';
          this.setDefaultChartLayout('chart' + i, this.graphs.summary['chart' + i].chart, type, color, title);

        });

      } else if (this.visualizationType === 'standard') {

        // setting standard chart area 1
        Object.values(this.widget.config.defibrillator.standard.standardArea1)
          .sort(this.standardArea1Sort.bind(this))
          .forEach((channel, i) => {
            if (!channel.type || !channel.value) {
              return;
            }
            const type = channel.type;
            const valuePacketField = channel.value;
            const color = channel.color;

            if (dataPacketFilterList.some(dpf => dpf.packetId === valuePacketField.packetId)) {
              const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === valuePacketField.packetId);
              if (!currentPacketFilter.fields[valuePacketField.id]) {
                Object.assign(currentPacketFilter.fields, valuePacketField.fieldSequence);
              }
            } else {
              const dataPacketFilter = new DataPacketFilter(
                valuePacketField.packetId,
                valuePacketField.fieldSequence,
                true
              );
              dataPacketFilterList.push(dataPacketFilter);
            }

            this.graphs.standard['chart' + i] = {
              chart: { },
              source: valuePacketField.packetId + ':' + valuePacketField.fieldSequence[valuePacketField.id]
            };

            let title = '';
            // TODO
            // if (type === 'ecg') {
            //   title = i === 0 ? 'II' : 'I';
            // } else if (type === 'spo2') {
            //   title = 'pleth';
            // } else {
            //   title = type;
            // }
            this.setDefaultChartLayout('chart' + i, this.graphs.standard['chart' + i].chart, type, color, title);

          });

      } else if (this.visualizationType === 'derivations') {
        // setting derivations chart area

        Object.keys(this.widget.config.defibrillator.derivations.derivationsArea).forEach((key, i) => {
          const channel = this.widget.config.defibrillator.derivations.derivationsArea[key];
          if (!channel.type || !channel.value) {
            return;
          }
          const type = channel.type;
          const valuePacketField = channel.value;
          const color = channel.color;

          if (dataPacketFilterList.some(dpf => dpf.packetId === valuePacketField.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === valuePacketField.packetId);
            if (!currentPacketFilter.fields[valuePacketField.id]) {
              Object.assign(currentPacketFilter.fields, valuePacketField.fieldSequence);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              valuePacketField.packetId,
              valuePacketField.fieldSequence,
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }

          this.graphs.derivations['chart' + key] = {
            chart: { },
            source: valuePacketField.packetId + ':' + valuePacketField.fieldSequence[valuePacketField.id]
          }
          this.setDefaultChartLayout('chart' + key, this.graphs.derivations['chart' + key].chart, type, color, this.derivationsTitleMap[i]);

        });

      }

      // setting standard chart area 1 parameters
      Object.keys(this.widget.config.defibrillator.standard.parametersArea1).forEach(key => {
        const channel: DefibrillatorSettings.Channel = this.widget.config.defibrillator.standard.parametersArea1[key];
        if (!channel.type || !channel.value) {
          return;
        }

        const packetToAdd = [
          channel.value,
          channel.max,
          channel.min,
          channel.unit,
        ];
        packetToAdd.forEach(packet => {
          if (!packet) {
            return;
          }
          if (dataPacketFilterList.some(dpf => dpf.packetId === packet.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packet.packetId);
            if (!currentPacketFilter.fields[packet.id]) {
              Object.assign(currentPacketFilter.fields, packet.fieldSequence);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              packet.packetId,
              packet.fieldSequence,
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }
        });

        if (channel.value) {
          this.parameters[key].valueSource = channel.value.packetId + ':' + channel.value.fieldSequence[channel.value.id];
        }
        if (channel.max) {
          this.parameters[key].maxSource = channel.max.packetId + ':' + channel.max.fieldSequence[channel.max.id];
        }
        if (channel.min) {
          this.parameters[key].minSource = channel.min.packetId + ':' + channel.min.fieldSequence[channel.min.id];
        }
        if (channel.unit) {
          this.parameters[key].unitSource = channel.unit.packetId + ':' + channel.unit.fieldSequence[channel.unit.id];
        }
      });

      // setting standard parameters area 2
      Object.keys(this.widget.config.defibrillator.standard.standardArea2).forEach((key, i) => {
        const channel: DefibrillatorSettings.Channel = this.widget.config.defibrillator.standard.standardArea2[key];
        if (!channel.type || !channel.value) {
          return;
        }

        const packetToAdd = [
          channel.value,
          channel.max,
          channel.min,
          channel.unit,
        ];
        packetToAdd.forEach(packet => {
          if (!packet) {
            return;
          }
          if (dataPacketFilterList.some(dpf => dpf.packetId === packet.packetId)) {
            const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packet.packetId);
            if (!currentPacketFilter.fields[packet.id]) {
              Object.assign(currentPacketFilter.fields, packet.fieldSequence);
            }
          } else {
            const dataPacketFilter = new DataPacketFilter(
              packet.packetId,
              packet.fieldSequence,
              true
            );
            dataPacketFilterList.push(dataPacketFilter);
          }
        });

        if (channel.value) {
          this.parameters[key].valueSource = channel.value.packetId + ':' + channel.value.fieldSequence[channel.value.id];
        }
        if (channel.max) {
          this.parameters[key].maxSource = channel.max.packetId + ':' + channel.max.fieldSequence[channel.max.id];
        }
        if (channel.min) {
          this.parameters[key].minSource = channel.min.packetId + ':' + channel.min.fieldSequence[channel.min.id];
        }
        if (channel.unit) {
          this.parameters[key].unitSource = channel.unit.packetId + ':' + channel.unit.fieldSequence[channel.unit.id];
        }
      });

      // setting standard parameters area 3
      // this.widget.config.defibrillator.standardArea3.types.forEach((x, i) => {
      //   const type = this.widget.config.defibrillator.standardArea3.types[i];
      //   const packetField = this.widget.config.defibrillator.standardArea3.packetField[i];
      //   const color = this.widget.config.defibrillator.standardArea3.colors[i];

      //   if (dataPacketFilterList.some(dpf => dpf.packetId === packetField.packetId)) {
      //     const currentPacketFilter = dataPacketFilterList.find(dpf => dpf.packetId === packetField.packetId);
      //     if (!currentPacketFilter.fields[packetField.id]) {
      //       Object.assign(currentPacketFilter.fields, packetField.fieldSequence);
      //     }
      //   } else {
      //     const dataPacketFilter = new DataPacketFilter(
      //       packetField.packetId,
      //       packetField.fieldSequence,
      //       true
      //     );
      //     dataPacketFilterList.push(dataPacketFilter);
      //   }

      //   this.parameters[type].source = packetField.packetId + ':' + packetField.fieldSequence[packetField.id];
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

      // updating summary charts
      if (this.visualizationType === 'summary') {
        const chartsToUpdate = Object.values(this.graphs.summary).filter((x: any) => x.source === packetId + ':' + fieldName) as any;

        chartsToUpdate.forEach(chart => {
          const defibrillatorElements = packetData.map(pd => ({ timestamp: pd.timestamp, trace: chart.chart.key, value: pd[fieldName] }));
          this.renderData(chart.chart.key, defibrillatorElements);
        });
      }

      // updateing standard charts
      if (this.visualizationType === 'standard') {
        const chartsToUpdate = Object.values(this.graphs.standard).filter((x: any) => x.source === packetId + ':' + fieldName) as any;

        chartsToUpdate.forEach(chart => {
          const defibrillatorElements = packetData.map(pd => ({ timestamp: pd.timestamp, trace: chart.chart.key, value: pd[fieldName] }));
          this.renderData(chart.chart.key, defibrillatorElements);
        });
      }

      // code for derivations
      if (this.visualizationType === 'derivations') {
        const derChartsToUpdate = Object.values(this.graphs.derivations).filter((x: any) => x.source === packetId + ':' + fieldName) as any;

        derChartsToUpdate.forEach(chart => {
          const defibrillatorElements = packetData.map(pd => ({ timestamp: pd.timestamp, trace: chart.chart.key, value: pd[fieldName] }));
          this.renderData(chart.chart.key, defibrillatorElements);
        });
      }

      // updateing parameters
      const parametersValueToUpdate = Object.values(this.parameters).filter((x: any) => x.valueSource === packetId + ':' + fieldName) as any;
      parametersValueToUpdate.forEach(parameter => {
        // passing last value of buffer to parameter
        parameter.value = packetData[packetData.length - 1][fieldName];
      });
      const parametersMaxToUpdate = Object.values(this.parameters).filter((x: any) => x.maxSource === packetId + ':' + fieldName) as any;
      parametersMaxToUpdate.forEach(parameter => {
        // passing last value of buffer to parameter
        parameter.max = packetData[packetData.length - 1][fieldName];
      });
      const parametersMinToUpdate = Object.values(this.parameters).filter((x: any) => x.minSource === packetId + ':' + fieldName) as any;
      parametersMinToUpdate.forEach(parameter => {
        // passing last value of buffer to parameter
        parameter.min = packetData[packetData.length - 1][fieldName];
      });
      const parametersUnitToUpdate = Object.values(this.parameters).filter((x: any) => x.unitSource === packetId + ':' + fieldName) as any;
      parametersUnitToUpdate.forEach(parameter => {
        // passing last value of buffer to parameter
        parameter.unit = packetData[packetData.length - 1][fieldName];
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
        shape: 'linear', // type === 'ecg' ? 'linear' : 'spline',
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
    const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-${key}-${this.isToolbarVisible}`);
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
    if (this.visualizationType === 'summary') {
      chartsToUpdate = Object.keys(this.graphs.summary);
    } else if (this.visualizationType === 'standard') {
      chartsToUpdate = Object.keys(this.graphs.standard);
    } else if (this.visualizationType === 'derivations') {
      chartsToUpdate = Object.keys(this.graphs.derivations);
    }
    chartsToUpdate.forEach(async(x,i) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-chart${i}-${this.isToolbarVisible}`);
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
    if (this.visualizationType === 'summary') {
      chartsToUpdate = Object.keys(this.graphs.summary);
    } else if (this.visualizationType === 'standard') {
      chartsToUpdate = Object.keys(this.graphs.standard);
    } else if (this.visualizationType === 'derivations') {
      chartsToUpdate = Object.keys(this.graphs.derivations);
    }
    chartsToUpdate.forEach(async(x,i) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-chart${i}-${this.isToolbarVisible}`);
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

  switchVisualization() {
    this.visualizationType = this.visualizationType === 'standard' ? 'derivations' : 'standard';
    this.configure();
  }

  chartSort<K, V>(a: KeyValue<K, V>, b: KeyValue<K, V>): number {
    return 0;
  }

  standardArea1Sort(a: DefibrillatorSettings.Channel, b: DefibrillatorSettings.Channel): number {
    const paramSort = this.standardParameters.map(sp => sp.type);

    const indexA = paramSort.indexOf(a.type);
    const indexB = paramSort.indexOf(b.type);

    if (indexA === -1 && indexB === -1) {
      return 0;
    } else if (indexA === -1) {
      return 1;
    } else if (indexB === -1) {
      return -1;
    } else {
      return indexA - indexB;
    }
  }

}
