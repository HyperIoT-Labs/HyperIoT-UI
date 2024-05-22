import { Component, Injector } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-sensor-value',
  templateUrl: './sensor-value.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './sensor-value.component.css']
})
export class SensorValueComponent extends BaseWidgetComponent {

  timestamp = new Date();
  sensorField: string;
  labelSensorField: string;
  isActivityLedOn = false;
  dataChannel: DataChannel;
  ledTimeout: any;
  sensorRenderValue: any;

  protected logger: Logger;

  constructor(injector: Injector, protected loggerService: LoggerService) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(SensorValueComponent.name);
  }
  
  ngAfterViewInit() {
    // TODO ?
    setTimeout(() => this.configure(), 500);
  }

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

    const hPacketFieldId = Object.keys(this.widget.config.packetFields)[0];
    this.sensorField = this.widget.config.packetFields[hPacketFieldId];
    this.labelSensorField = this.widget.config.fieldAliases[hPacketFieldId] || this.widget.config.packetFields[hPacketFieldId];

    const dataPacketFilter = new DataPacketFilter(
      this.widget.config.packetId,
      this.widget.config.packetFields,
      true
    );
    this.dataChannel = this.dataService.addDataChannel(
      +this.widget.id,
      [dataPacketFilter]
    );
    if(this.widget.config.fieldTypes[hPacketFieldId]) this.dataChannel.addTimestampFieldToFormat([this.sensorField])
    this.dataSubscription = this.dataChannel.subject.subscribe(res => {
      this.computePacketData(res.data);
    });
  }

  computePacketData(packetData: PacketData[]) {
    super.computePacketData(packetData);

    packetData.forEach(datum => this.renderData(datum));
  }

  renderData(datum: PacketData) {
    this.timestamp = datum.timestamp;
    if(this.canRender(datum[this.sensorField]))
      this.sensorRenderValue = datum[this.sensorField];

    this.blinkLed();
  }

  canRender(field: any){
    return field || typeof field == "boolean"
  }

  blinkLed() {
    this.isActivityLedOn = true;
    if (this.ledTimeout != null) {
      clearTimeout(this.ledTimeout);
      this.ledTimeout = null;
    }
    this.ledTimeout = setTimeout(() => this.isActivityLedOn = false, 100);
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
    }
    this.widgetAction.emit(widgetAction);
  }

}
