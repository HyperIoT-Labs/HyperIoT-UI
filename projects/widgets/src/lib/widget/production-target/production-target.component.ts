import { Component, Injector, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { Subscription } from 'rxjs';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';

@Component({
  selector: 'hyperiot-production-target',
  templateUrl: './production-target.component.html',
  styleUrls: ['./production-target.component.css']
})
export class ProductionTargetComponent extends BaseGenericComponent implements OnInit {
  isPaused = false;

  dataChannel: DataChannel;
  
  chartData: { [field: string]: any }[] = [];

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
      packetAndFieldsToRetrive = Object.entries(this.widget.config.productionTargetSettings.fields).reduce((acc, [id, values]) => {
        if (acc[id]) {
          acc[id] = values;
        } else {
          acc[id] = values;
        }
        return acc;
      }, {});
    };
    this.subscribeDataChannel(packetAndFieldsToRetrive);
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
