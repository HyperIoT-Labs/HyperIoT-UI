import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { DataChannel, DataPacketFilter, HPacketField, Logger, LoggerService, PacketData, DateFormatterService } from 'core';
import { Subject, Subscription } from 'rxjs';
import { BaseTableComponent } from '../../base/base-table/base-table.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';
import { ServiceType } from '../../service/model/service-type';

@Component({
  selector: 'hyperiot-hpacket-table',
  templateUrl: './hpacket-table.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './hpacket-table.component.scss'],
})
export class HpacketTableComponent extends BaseTableComponent implements AfterViewInit {

  @ViewChild('tableChild', { static: false }) tableChild;

  readonly TABLE_LIMIT = 400;
  tableHeaders = [];
  tableSource: Subject<any[]> = new Subject<any[]>();

  DEFAULT_MAX_TABLE_LINES = 50;

  timestamp = new Date();
  totalLength = 0;
  pRequest: Subscription;
  dataSubscription: Subscription;
  offControllerSubscription: Subscription;

  loadingOfflineData = false;

  protected dataChannel: DataChannel;
  channelId: number;

  allData: PacketData[] = [];

  protected logger: Logger;

  constructor(
    private dateFormatterService: DateFormatterService,
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(HpacketTableComponent.name);
  }

  ngAfterViewInit() {
    // TODO 500 ms?
    setTimeout(() => this.configure(), 500);
  }

  configure(): void {
    super.removeSubscriptionsAndDataChannels();
    this.allData = [];
    if (this.tableChild) {
      this.tableChild.resetTable();
    }
    // this.dataLoader.initConfig(this.widget);

    if (!this.serviceType) {
      this.logger.error('TYPE SERVICE UNDEFINED');
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
    // Set header
    let fieldIds = [];

    if (this.widget.config?.packetFields) {
      fieldIds = Object.keys(this.widget.config?.packetFields);
    }
    if (fieldIds.length > 0) {
      this.tableHeaders = fieldIds.map(hPacketFieldId => ({
        value: this.widget.config.packetFields[hPacketFieldId],
        label: this.widget.config.fieldAliases[hPacketFieldId] || this.widget.config.packetFields[hPacketFieldId],
        type: this.widget.config.fieldTypes[hPacketFieldId]
      }));
    }
    this.tableHeaders.push({
      value: 'timestamp',
      label: this.widget.config.timestampFieldName,
      type: 'DATE'
    });  // display timestamp too

    // TODO problema che dati che arrivano prima del render 
    setTimeout(() => {
      this.subscribeDataChannel();
      if (this.serviceType === ServiceType.ONLINE) {
        this.computePacketData(this.initData.reverse());
      }
    }, 0);

  }

  subscribeDataChannel() {
    const dataPacketFilter = new DataPacketFilter(this.widget.config.packetId, this.widget.config.packetFields, true);
    this.channelId = +this.widget.id;
    if (!this.isToolbarVisible && this.serviceType === ServiceType.OFFLINE) {
      // setting negative id to fullscreen offline widget channel to prevent updating original widget
      // TODO channelId should be a proper string
      this.channelId = -this.channelId;
      this.dataChannel = this.dataService.copyDataChannel(this.channelId, -this.channelId);
    } else {
      this.dataChannel = this.dataService.addDataChannel(this.channelId, [dataPacketFilter]);
    }
    this.dataChannel.addTimestampFieldToFormat(
      this.tableHeaders.filter(el=> el.type === HPacketField.TypeEnum.TIMESTAMP).map(el=> el.value), 
    );
    
    this.dataSubscription = this.dataChannel.subject.subscribe((eventData) => this.computePacketData(eventData.data));
    if (this.serviceType === ServiceType.OFFLINE) {
      this.offControllerSubscription = this.dataChannel.controller.$totalCount.subscribe(res => {
        if (!this.isToolbarVisible) { // if fullscreen
          this.tableChild.totalRows = res;
          this.computePacketData(this.initData);
        } else {
          this.allData = [];
          this.tableChild.resetTable(res, true);
        }
      });
    }
  }

  // TODO si potrebbe portare su super
  computePacketData(packetData: PacketData[]) {
    super.computePacketData(packetData);
    if (packetData.length === 0) {
      return;
    }
    this.allData = this.allData.concat(packetData);
    const tableData: any[] = [];
    packetData.forEach(pd => {
      const el: any = {...pd};
      el.timestamp = this.dateFormatterService.formatDate(el.timestamp);
      tableData.push(el);
    });
    this.tableSource.next(tableData);
    this.loadingOfflineData = false;
  }

  // OFFLINE
  dataRequest(lowerBound) {
    this.loadingOfflineData = true;
    if (this.pRequest) {
      this.pRequest.unsubscribe();
    }
    this.dataService.loadNextData(this.channelId);
  }

  play(): void {
    this.dataChannel.controller.play();
  }

  pause(): void {
    this.dataChannel.controller.pause();
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

  removeSubscriptionsAndDataChannels() {
    if (this.dataSubscription && this.dataService) {
      this.dataSubscription.unsubscribe();
      this.dataService.removeDataChannel(this.channelId);
    }
  }

}

export interface Result {
  fields: Field[];
  timestampField: string;
}

export interface Field {
  name: string;
  value: number;
}

