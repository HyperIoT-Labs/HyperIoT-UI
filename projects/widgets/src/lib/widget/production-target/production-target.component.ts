import { Component, Injector, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { Subscription } from 'rxjs';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';

@Component({
  selector: 'hyperiot-production-target',
  templateUrl: './production-target.component.html',
  styleUrls: ['./production-target.component.scss']
})
export class ProductionTargetComponent extends BaseGenericComponent implements OnInit {
  isPaused = false;

  /**
   * Container for the graph specifics
   */
  graph: any = {};

  dataChannel: DataChannel;

  chartData: { [field: string]: any }[] = [
    { target: 'test' },
    { produced: 'test' },
    { current_shift: 'test' },
    { remaining: '' }
  ];

  chartLabels: string[] = ['target', 'produced', 'current_shift', 'remaining']

  protected dataChannelList: DataChannel[] = [];
  dataSubscription: Subscription;

  protected logger: Logger;

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(ProductionTargetComponent.name);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
      return;
    }

    super.configure();

    if (
      !(
        this.widget.config != null
      )
    ) {
      this.isConfigured = false;
      return;
    }
    this.isConfigured = true;
    let packetAndFieldsToRetrive: { [id: number]: string } = {};
    if (this.widget.config.productionTargetSettings) {
      Object.keys(this.widget.config.productionTargetSettings.fields).map(key => {
        const obj = this.widget.config.productionTargetSettings.fields[key];
        if (packetAndFieldsToRetrive[obj.packet]) {
          if (packetAndFieldsToRetrive[obj.packet] !== obj.field) {
            packetAndFieldsToRetrive[obj.packet] = obj.field;
          }
        } else {
          packetAndFieldsToRetrive[obj.packet] = obj.field;
        }
      });
    };
    this.subscribeDataChannel(packetAndFieldsToRetrive);
    this.processPlotlyData()
  }

  subscribeDataChannel(packetAndFieldsToRetrive) {
    const dataPacketFilterList = Object.keys(packetAndFieldsToRetrive).map(key => new DataPacketFilter(+key, packetAndFieldsToRetrive[key], true));
    const dataChannel = this.dataService.addDataChannel(+this.widget.id, dataPacketFilterList);
    this.dataSubscription = dataChannel.subject.subscribe(packet => {
      if (packet['data'].length > 0) {
        super.computePacketData(packet.data);
        this.convertAndBufferData([packet]);
      } else {
        this.logger.debug('initStream: data is empty');
      }
    });
    this.dataChannelList.push(dataChannel);
  }

  convertAndBufferData(packet) {
    packet.forEach((packetData) => {
      if (packetData.length === 0) {
        return;
      }
      try {
        packetData.data.forEach((element: PacketData[]) => {
          if (Object.keys(element).includes('timestamp')) {
            delete element['timestamp'];
          }
          Object.keys(element).forEach((key: string) => {
            this.chartData[key] = element[key];
          })
        })
      }
      catch (e) {
        console.error('[convertAndBufferData] external error', e);
      }
    })
  }

  processPlotlyData() {
    this.graph = {
      data: [
        {
          values: [70, 30],
          type: 'pie',
          marker: {
            line: {
              color: '#FFFFFF',
              width: [2, 2, 2]
            },
          },
          hole: .4,
          showlegend: false,
          textinfo: 'none',
          textposition: 'inside',
          hovertemplate: 'test'
        },
      ],
      layout: {
        width: '150',
        height: '150',
        autosize: true,
        margin: {
          l: 5,
          r: 5,
          b: 5,
          t: 5
        },
        annotations: [
          {
            font: {
              size: 13
            },
            showarrow: false,
            text: '70',
            x: 0.5,
            y: 0.5
          }
        ]
      },
    };
  }

  play(): void {
    this.isPaused = false;
    this.dataChannelList.forEach(dataChannel => dataChannel.controller.play());
  }

  pause(): void {
    this.isPaused = true;
    this.dataChannelList.forEach(dataChannel => dataChannel.controller.pause());
  }

  onToolbarAction(action: string) {
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
    }

    this.widgetAction.emit({ widget: this.widget, action });
  }
}
