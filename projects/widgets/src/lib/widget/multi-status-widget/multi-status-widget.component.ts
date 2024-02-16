import { Component, Injector, OnInit } from '@angular/core';
import convert from 'convert-units';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { PartialObserver, Subject } from 'rxjs';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

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

  chartLabels: { id: number; label: string }[] = [];
  chartData: { [field: string]: any }[] = [];

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
    labelsIds.forEach((id: string) => this.chartLabels.push(this.widget.config.fieldAliases[id] ?
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
      packetData.data.forEach((element: PacketData[]) => {
        const filteredKeys = Object.keys(element).filter((key: string) => Object.values(this.widget.config.packetFields).includes(key));
        filteredKeys.forEach((key: string) => {
          console.log('key', key)
          const field = Object.values(this.widget.config.packetFields).find(field => field === key);
          const fieldId = this.getFieldIdByName(this.widget.config.packetFields, field);
          this.chartData[field] = { defaultValue: this.widget.config.fieldValuesMapList[fieldId].defaultValue };
          this.findFieldBasedOnType(fieldId, packetData.data, element[field], field);
        })
      })
    })
  }

  getFieldIdByName(packetFields, fieldName) {
    return +Object.keys(packetFields).find(key => packetFields[key] === fieldName);
  }


  findFieldBasedOnType(fieldId: number, field: any, element: any, fieldName: string) {
    let fieldType = 'DEFAULT';
    try {
      fieldType = this.widget.config.fieldTypes[fieldId];
    } catch (error) { }
    let output;
    switch (fieldType) {
      case 'DEFAULT':
      case 'INTEGER':
      case 'DOUBLE':
      case 'FLOAT': {
        output = this.widget.config.fieldValuesMapList[fieldId].valuesMap.find(ele => typeof element === 'number' && parseInt(ele.value) === element)?.output;
        break;
      }
      case 'FILE':
      case 'TEXT': {
        output = this.widget.config.fieldValuesMapList[fieldId].valuesMap.find(ele => ele.value === element)?.output;
        break;
      }
      case 'OBJECT': {
        output = this.widget.config.fieldValuesMapList[fieldId].valuesMap.find(ele => this.areObjectsEqual(ele.value, element))?.output;
        break;
      }
    }

    if (output) this.chartData[fieldName].output = output;
  }

  areObjectsEqual(configElement: {}, packetFieldElement: {}) {
    Object.keys(configElement).length === Object.keys(packetFieldElement).length &&
      (Object.keys(configElement) as (keyof typeof configElement)[]).every((key) => {
        return (
          Object.prototype.hasOwnProperty.call(packetFieldElement, key) && configElement[key] === packetFieldElement[key]
        );
      });
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
}