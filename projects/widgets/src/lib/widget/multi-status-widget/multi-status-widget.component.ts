import { Component, Injector, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService } from 'core';
import { PartialObserver, Subject } from 'rxjs';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';

@Component({
  selector: 'hyperiot-multi-status-widget',
  templateUrl: './multi-status-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './multi-status-widget.component.scss']
})
export class MultiStatusWidgetComponent extends BaseWidgetComponent implements OnInit {
  /**
   * DataChannel to subscribe to retrieve data
   */
  dataChannel: DataChannel;

  chartLabels: any = [];
  chartData: any = [];

  loadingOfflineData: boolean = false;

  protected logger: Logger;

  allData$: Subject<any[]> = new Subject();

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(MultiStatusWidgetComponent.name);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();
  }

  configure() {
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
    const labelsIds = Object.keys(this.widget.config.packetFields);
    this.chartLabels = [];
    labelsIds.forEach(id => this.chartLabels.push(this.widget.config.fieldAliases[id] ?
      { id: this.widget.config.packetFields[id], label: this.widget.config.fieldAliases[id] } :
      { id: this.widget.config.packetFields[id], label: this.widget.config.packetFields[id] }));


    this.initStream();
    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );
    this.subscribeRealTimeStream(dataPacketFilter, (eventData) => {
      this.allData$.next(eventData);
    });
  }

  subscribeRealTimeStream(dataPacketFilter: DataPacketFilter, observerCallback: PartialObserver<[any, any]> | any): void {
    this.dataChannel = this.dataService.addDataChannel(+this.widget.id, [dataPacketFilter]);
    this.dataSubscription = this.dataChannel.subject.subscribe(observerCallback);
  }

  /**
   * Manipulate stream data from allData$ and set observer for pause/play features
   */
  initStream() {
    if (this.initData.length > 0) {
      this.convertAndBufferData(this.initData);
    }
    // subscribe data stream and update data
    this.allData$.pipe().subscribe((packet) => {
      if (packet['data'].length > 0) {
        this.convertAndBufferData([packet]);
      } else {
        this.logger.debug('initStream: data is empty');
      }
    });
  }

  convertAndBufferData(packet) {
    packet.forEach((packetData) => {
      if (packetData.length === 0) {
        return;
      }

      packetData.data.forEach(element => {
        const field = Object.values(this.widget.config.packetFields).find(field => Object.keys(element).find(label => label === field));
        const fieldId = Object.keys(this.widget.config.packetFields).find(e => this.widget.config.packetFields[e] == field);
        if (field) {
          this.chartData[field] = this.widget.config.fieldValuesMapList[fieldId].find(ele => ele.value == element[field]).output;
        }
      })
    })
  }
}