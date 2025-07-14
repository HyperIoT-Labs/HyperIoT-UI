import { Directive, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DevDataService, IDataService, Logger, LoggerService, OfflineDataService, PacketData, RealtimeDataService } from 'core';
import convert from 'convert-units';
import { Subscription } from 'rxjs';
import { TimeSeries } from '../../data/time-series';
import { ServiceType } from '../../service/model/service-type';
import { CommonToolbarComponent } from '../../widget/common-toolbar/common-toolbar.component';
import { WidgetAction, WidgetConfig } from './model/widget.model';
import {
  DataSimulatorSettings
} from "../../dashboard/widget-settings-dialog/data-simulator-settings/data-simulator.models";

@Directive()
export abstract class BaseWidgetComponent implements OnChanges, OnInit, OnDestroy {

  @Input() widget: WidgetConfig;
  @Input() serviceType: ServiceType;
  @Input() initData: PacketData[] | any = []; // any because of events-log
  @Input() isToolbarVisible = true;

  protected dataSubscription: Subscription;
  protected dataService: IDataService;
  public serviceTypeList: typeof ServiceType = ServiceType;
  public isConfigured = false;

  // used to signal widget actions
  @Output() widgetAction: EventEmitter<WidgetAction> = new EventEmitter<WidgetAction>();

  @ViewChild('toolbar') toolbar: CommonToolbarComponent;

  widgetConfig: any | undefined = undefined;

  protected logger: Logger;

  constructor(
    protected injector: Injector,
    protected loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(BaseWidgetComponent.name);
  }

  ngOnInit(): void {
    if (this.serviceType === ServiceType.OFFLINE) {
      this.dataService = this.injector.get<IDataService>(OfflineDataService);
    } else if (this.serviceType === ServiceType.ONLINE) {
      this.dataService = this.injector.get<IDataService>(RealtimeDataService);
    } else if (this.serviceType === ServiceType.DEV) {
      this.dataService = this.injector.get<IDataService>(DevDataService);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.widget && changes.widget.currentValue) {
      changes.widget.currentValue.instance = this;
    }
  }

  /**
   * This method is called to apply the current
   * widget configuration.
   */
  abstract configure(): void;

  getWidgetConfig() {
    if (!(this.widget.config !== null
      && this.widget.config.packetId !== null
      && this.widget.config.packetFields !== null
      && Object.keys(this.widget.config.packetFields).length > 0)) {
      this.isConfigured = false;
      return;
    }
    this.widgetConfig = this.widget.config;
    this.widgetConfig.layout = this.widgetConfig.layout || {};
    this.widgetConfig.layout.margin = this.widgetConfig.layout.margin || {
      l: 0,
      r: 32,
      b: 0,
      t: 0,
      pad: 0
    };
    this.widgetConfig.seriesConfig = this.widgetConfig.seriesConfig || [];
  }

  /**
   * Adds new data to a time series.
   *
   * @param series The series to add data to
   * @param x The x value (Date)
   * @param y The y value (number)
   */
  bufferData(series: TimeSeries, x: Date, y: number): void {
    // NOTE: `series` is just a local copy of chart data,
    // NOTE: the real data is stored in the plotly graph object
    series.x.push(new Date(x));
    series.y.push(y);
    series.lastBufferIndexUpdated++;
  }

  onToolbarAction(action: string): void {
    switch (action) {
      case 'toolbar:play':
        break;
      case 'toolbar:pause':
        break;
      case 'toolbar:close':
        break;
    }

    this.widgetAction.emit({ widget: this.widget, action });
  }

  convert(data?) {
    return convert(data);
  }

  // TODO is field type unique?
  getFieldIdByName(packetFields, fieldName) {
    return +Object.keys(packetFields).find(key => packetFields[key] === fieldName);
  }

  computePacketData(packetData: PacketData[], convertOldValues = true) {
    if (!this.widget.config.fieldUnitConversions) {
      return;
    }

    // applying unit conversion and approximation
    packetData.forEach(pd => {
      const packetKeys = Object.keys(pd);
      packetKeys.forEach(packetKey => {
        const fieldId = this.getFieldIdByName(this.widget.config.packetFields, packetKey);
        let fieldType = 'DEFAULT';
        try {
          // support old configuration with no fieldTypes
          // TODO all configs should contain information about field type
          fieldType = this.widget.config.fieldTypes[fieldId];
        } catch (error) { }
        switch (fieldType) {
          case 'DEFAULT':
          case 'INTEGER':
          case 'DOUBLE':
          case 'FLOAT': {

            if (!convertOldValues) {
              return;
            }

            // TODO: inserire qui la conversione dei valori con expression
            const unitConversion = this.widget.config.fieldUnitConversions[fieldId];
            // temp fix. packet values shouldn't be forcibly converted

            if (!isNaN(parseFloat(pd[packetKey]))) {
              pd[packetKey] = parseFloat(pd[packetKey]);
            }

            if (unitConversion && typeof pd[packetKey] === 'number') {
              // applying unit conversion
              if (unitConversion.convertFrom !== unitConversion.convertTo) {
                pd[packetKey] = convert(pd[packetKey])
                  .from(unitConversion.convertFrom)
                  .to(unitConversion.convertTo);
              }

              pd[packetKey] = +pd[packetKey];

              // applying approximation
              try {
                pd[packetKey] = pd[packetKey].toFixed(unitConversion.decimals);
              }
              catch (error) {
                this.logger.error(error);
              }

              try {
                if (
                  this.widget.config.fieldCustomConversions
                  && this.widget.config.fieldCustomConversions[fieldId]
                  && this.widget.config.fieldCustomConversions[fieldId].expression
                  && this.widget.config.fieldCustomConversions[fieldId].expression.trim() !== ''
                ) {
                  let expression: string = this.widget.config.fieldCustomConversions[fieldId].expression;
                  for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
                    expression = expression.replace(
                      operator.regex,
                      operator.function
                    );
                  }
                  const expressionAsString = expression.replace(/\$val/g, pd[packetKey]);
                  pd[packetKey] = new Function(`return ${expressionAsString}`)();
                }
              } catch (error) {
                this.logger.error(error);
              }
            }
            break;
          }
          case 'TEXT': {
            pd[packetKey] = pd[packetKey].bytes ? atob(pd[packetKey].bytes) : pd[packetKey];
            break;
          }
          case 'BOOLEAN': {
            // no action needed
            break;
          }
          case 'OBJECT': {
            // pd[packetKey] = JSON.stringify(pd[packetKey]);
            break;
          }
          case 'FILE': {
            pd[packetKey] = {
              projectId: this.widget.projectId,
              packetId: this.widget.config.packetId,
              timestamp: new Date(pd.timestamp).getTime(),
              fieldId,
              mimeType: this.widget.config.fieldFileMimeTypes[fieldId]
            };
            break;
          }
        }

      });
    });

  }

  ngOnDestroy(): void {
    this.removeSubscriptionsAndDataChannels();
  }

  /**
   * Fn used on destroy and before each widget configuration rendering
   * The use of it is to close subscriptions and remove data channels no longer active
   */
  removeSubscriptionsAndDataChannels() {
    if (this.dataSubscription && this.dataService) {
      this.dataSubscription.unsubscribe();
      this.dataService.removeDataChannel(this.widget.id);
    }
  }
}


