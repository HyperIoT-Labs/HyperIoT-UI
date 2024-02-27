import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketDataChunk } from 'core';
import { Subject } from 'rxjs';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-dynamic-label-value-widget',
  templateUrl: './dynamic-label-value-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './dynamic-label-value-widget.component.scss']
})
export class DynamicLabelValueWidgetComponent extends BaseWidgetComponent implements OnInit, OnDestroy {
  /**
   * DataChannel to subscribe to retrieve data
   */
  dataChannel: DataChannel;

  /** Subject used to manage open subscriptions. */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  chartLabels: { id: number; label: string }[] = [];
  chartData: { [field: string]: any }[] = [];

  loadingOfflineData: boolean = false;

  protected logger: Logger;

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(DynamicLabelValueWidgetComponent.name);
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
    this.dataChannel = this.dataService.addDataChannel(+this.widget.id, [dataPacketFilter]);
    this.dataSubscription = this.dataChannel.subject.subscribe((packet: PacketDataChunk) => {
      if (packet.data.length > 0) {
        this.logger.debug('computePacketData -> packetData: ', packet);
        super.computePacketData(packet.data);
        this.convertAndBufferData([packet]);
      } else {
        this.logger.debug('initStream: data is empty');
      }
    });
  }

  /**
   * Add initial data
   */
  initStream() {
    if (this.initData.length > 0) {
      this.convertAndBufferData(this.initData);
    }
  }

  convertAndBufferData(packet) {
    packet.forEach((packetData) => {
      if (packetData.length === 0) {
        return;
      }
      packetData.data.forEach(element => {
        Object.values(this.widget.config.packetFields).forEach(key => {
          if (element.hasOwnProperty(key)) {
            this.chartData[key] = element[key];
          }
        });
      });
    })
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
    }

    this.widgetAction.emit(widgetAction);
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }
}
