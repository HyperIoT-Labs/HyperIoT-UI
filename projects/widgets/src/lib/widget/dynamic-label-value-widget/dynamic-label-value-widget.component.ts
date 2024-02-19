import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService } from 'core';
import { PartialObserver, Subject, takeUntil } from 'rxjs';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';

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

  allData$: Subject<any[]> = new Subject();

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
    // subscribe data stream and update datatable
    this.allData$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((packet) => {
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
        Object.values(this.widget.config.packetFields).forEach(key => {
          if (element.hasOwnProperty(key)) {
            this.chartData[key] = element[key];
          }
        });
      });
    })
  }

  ngOnDestroy(){
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }
}
