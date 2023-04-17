import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService } from 'core';
import {
  PartialObserver,
  Subject,
  asyncScheduler
} from 'rxjs';
import { BaseTableComponent } from '../../base/base-table/base-table.component';
import { ServiceType } from '../../service/model/service-type';
import { EcgElement } from './ecg.model';
import { PlotlyService } from 'angular-plotly.js';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-ecg',
  templateUrl: './ecg.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './ecg.component.scss'],
})
export class EcgComponent extends BaseTableComponent implements OnInit {
  allData$: Subject<any[]> = new Subject();
  isPaused = false;

  timestamp: string = '';
  packetFields: Array<string> = [];
  ecgKeys: Array<any> = [];
  graph: any = Object.create({});;

  
  allData: any[] = [];

  protected dataChannel: DataChannel;
  graphsList: Array<any> = [];

  protected logger: Logger;

  constructor(
    injector: Injector, 
    @Optional() public plotly: PlotlyService,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(EcgComponent.name);
  }

  ngOnInit(): void {
    this.logger.debug(this.widget.name);
    super.ngOnInit();

    this.configure();
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    if (this.widget.config && this.widget.config?.packetFields) {
      this.packetFields = Object.values(this.widget.config?.packetFields);
    }
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
    this.graphsList = [];
    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
      return;
    }

    super.configure();

    if (this.serviceType === ServiceType.OFFLINE) {} else {
      // Come distribuire i dati
      this.initStream();
      const dataPacketFilter = new DataPacketFilter(
        this.widget.config.packetId, 
        this.widget.config.packetFields,
        true
        );
      // TODO forse volevamo imporre noi il timestamp, invece di usare quello dell'apparecchio che potrebbe non essere corretto
      // se noi saremo invece certi che il timestamp del dispositivo sia corretto usiamo quello
      this.subscribeRealTimeStream(dataPacketFilter, (eventData) => {
        this.allData$.next(eventData);
      });
    }

    if (this.widget.config) {
      if (JSON.stringify(this.widget.config.packetFields) !== JSON.stringify(this.ecgKeys)) {
        Object.values(this.widget.config.packetFields).forEach((field, idx) => {
          if (!this.graph[+idx]) { 
            asyncScheduler.schedule(() =>
              this.setChartLayout(field, +idx)
            )
          }
        })
      }
    }
  }

  setChartLayout(field: string, traceId: number) {
    this.ecgKeys.push(field);
    if (this.graphsList[traceId]) { 
      return;
    }

    this.graph = Object.create({});
    this.graph.key = '';
    this.graph.data = [];
    this.graph.layout = [];
    this.graph.config = {};

    this.graph.data.name = field;
    this.graph.data.mode = 'lines';
    if (this.widget.config.colors) {
      this.graph.data.line = {
        color: this.widget.config.colors[field],
        width: 3,
        shape: 'spline',
        smoothing: 1.3
      }
    }

    this.graph.data.type = 'scatter';
    this.graph.data.connectgaps = true;

    this.graph.layout.axis = {
      type: 'date'
    };
    this.graph.layout.dragmode = 'pan';
    this.graph.layout.selectdirection = 'h';
    this.graph.layout.xref = 'paper';
    this.graph.layout.text = `Trace ${field}`;
    this.graph.layout.font = {
      size: 9,
    };
    this.graph.layout.title = `Trace ${field}`;
    this.graph.layout.height = (document.querySelector("hyperiot-ecg").clientHeight-20)/Object.keys(this.widget.config.packetFields).length;
    this.graph.layout.margin = {
      l: 140,
      r: 180,
      b: 100,
      t: 100,
      pad: 0,
    };
    this.graph.layout.showarrow = false;
    this.graph.layout.autosize = true;
    this.graph.layout.font = {
      size: 16,
      color: 'black'
    };

    this.graph.layout.autotick = true;
    this.graph.layout.xaxis = {
      autorange: true,
      color: 'black',
    };
    this.graph.layout.yaxis = {
      fixedrange: true,
      color: 'black',
    }
    this.graph.layout.font = {
      size: 16,
      color: 'black'
    };

    
    if (this.widget.config.bgColor === 'dark') {
      this.graph.layout.plot_bgcolor = 'black';
      this.graph.layout.paper_bgcolor = 'black';

      this.graph.layout.modebar = { color: '#d1d1d1'};

      this.graph.layout.xaxis.gridcolor = '#d1d1d1';
      this.graph.layout.xaxis.gridwidth = 1;
      this.graph.layout.xaxis.color = '#d1d1d1';

      this.graph.layout.yaxis.gridcolor = '#d1d1d1';
      this.graph.layout.yaxis.gridwidth = 1;
      this.graph.layout.yaxis.zerolinecolor = '#d1d1d1';
      this.graph.layout.yaxis.zerolinewidth = 1;
      this.graph.layout.yaxis.color = '#d1d1d1';
      
      this.graph.layout.font.color = '#d1d1d1';
    }

    this.graph.key = field;
    this.graph.config = {
      responsive: true,
      modeBarButtonsToRemove: ['resetScale2d','autoScale2d', 'zoomIn2d', 'zoomOut2d']
    };
    this.graphsList.push(this.graph);
  }

  /**
   * Manipulate stream data from allData$ and set observer for pause/play features
   */
  initStream() {    
    if (this.initData.length > 0) {
      this.convertAndBufferData(this.initData);
    }
    // subscribe data stream and update datatable
    this.allData$.pipe().subscribe((packet) => {
      if (packet['data'].length > 0) {
        this.convertAndBufferData([packet]);
      } else {
        this.logger.debug('initStream: data is empty');
      }
    });
  }

  convertAndBufferData(packet) {
    this.allData = this.allData.concat(packet);
    packet.forEach((packetData) => {
      packetData['data'].forEach(datum => {
        this.timestamp = this.widget.config.timestampFieldName;
        Object.keys(datum).forEach( (key) => {
          if (this.packetFields.find(field => field === key)) {
            const ecgElement: EcgElement = {};
            ecgElement[this.timestamp] = datum[this.timestamp];
            ecgElement.trace = key;
            ecgElement.value = datum[key];
            this.renderData(key, ecgElement);
          }
        })
      })
    })
  }

  async renderData(key: string, ecgElement: EcgElement) {
    const Plotly = await this.plotly.getPlotly();
    const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-${key}-${this.isToolbarVisible}`);
    if (graph) {
      let data = {}
      const currentDate = new Date(ecgElement[this.timestamp]);
      if (graph.data && graph.data[0]) {
        data = {};
        data['x'] = [[currentDate]];
        data['y'] = [[ecgElement.value]];
        Plotly.extendTraces(graph, data, [0]);
        const rangeOne = new Date(currentDate.getTime() - (Number.parseInt(`${this.widget.config.internalConfig.dataRange}000`)));
        Plotly.relayout(graph.id, {
          xaxis: {
            range: [rangeOne, currentDate] 
          }
        });
      } else {
        ecgElement[this.timestamp] = currentDate;
        data = this.addDataToEmptyChart(graph, ecgElement);
        Plotly.react(graph.id, [data[0]], data[1]);
      }
    }
  }

  addDataToEmptyChart(graph, ecgElement) {
    let data = { ...graph.data };
    let layout = { ...graph.layout };
    data['x'] = [ecgElement[this.timestamp]];
    data['y'] = [ecgElement.value];
    return [data, layout];
  }

  subscribeRealTimeStream(dataPacketFilter: DataPacketFilter, observerCallback: PartialObserver<[any, any]> | any): void {
    this.dataChannel = this.dataService.addDataChannel(+this.widget.id, [dataPacketFilter]);
    this.dataSubscription = this.dataChannel.subject.subscribe(observerCallback);
  }

  play(): void {
    this.dataChannel.controller.play();
    this.packetFields.forEach( async (field) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-${field}-${this.isToolbarVisible}`);
      delete graph.layout.xaxis.rangeslider;
      Plotly.react(graph.id, graph.data, graph.layout, { 
        modeBarButtonsToRemove: ['resetScale2d','autoScale2d', 'zoomIn2d', 'zoomOut2d']
      });
    });
  }

  pause(): void {
    this.dataChannel.controller.pause();
    this.packetFields.forEach( async (field) => {
      const Plotly = await this.plotly.getPlotly();
      const graph: any = this.plotly.getInstanceByDivId(`widget-${this.widget.id}-${field}-${this.isToolbarVisible}`);
      let layout = {...graph.layout};
      layout.xaxis['rangeslider'] = [graph.data[0]['x'][0], graph.data[0]['x'][graph.data[0]['x'].length]];
      Plotly.react(graph.id, graph.data, graph.layout, {});
    })
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
