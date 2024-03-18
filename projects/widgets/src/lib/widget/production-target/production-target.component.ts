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

  /**
   * Plotly pie chart variables
   */
  chartData: { [field: string]: any }[] = [];
  chartDataLabels: string[] = ['Produced', 'Target'];
  chartDataColors: string[] = ['#00aec5', '#ffffff'];

  /**
   * Filled with labels on data channel data retrieval, starts with remaining since it's a value we extrapolate from target - produced
   */
  widgetLabels: string[] = ["target", "current_shift", "produced", "remaining"];

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

  /**
   * Setup widget configuration
   */
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
    let packetAndFieldsToRetrive: { [packetId: number]: { [id: number]: string } } = {};
    if (this.widget.config.productionTargetSettings) {
      if (this.widget.config.productionTargetSettings.isTargetManuallySet === 'true') {
        this.chartData['target'] = parseInt(this.widget.config.productionTargetSettings.targetManuallySetValue);
      };
      Object.keys(this.widget.config.productionTargetSettings.fields).map(key => {
        const packetId = this.widget.config.productionTargetSettings.fields[key].packet;
        const field = this.widget.config.productionTargetSettings.fields[key].field;
        const fieldValue = { [field.fieldId[0]]: field.fieldName };
        if (packetAndFieldsToRetrive[parseInt(packetId)]) {
          packetAndFieldsToRetrive[parseInt(packetId)] = { ...packetAndFieldsToRetrive[parseInt(packetId)], ...fieldValue };
        } else {
          packetAndFieldsToRetrive[parseInt(packetId)] = fieldValue;
        }
      });
    };
    this.subscribeDataChannel(packetAndFieldsToRetrive);
    this.processPlotlyData()
  }

  /**
   * Subscibe all fields to data channel
   * @param packetAndFieldsToRetrive 
   */
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

  /**
   * Convert and buffer data retrieved from data channel
   * @param packet 
   */
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
            const chartKeys = Object.keys(this.widget.config.productionTargetSettings.fields).filter(fieldKey => this.widget.config.productionTargetSettings.fields[fieldKey].field.fieldName === key)
            chartKeys.forEach(chartKey => this.chartData[chartKey] = element[key]);
          })
          this.processPlotlyData();
        })
      }
      catch (e) {
        this.logger.error('[convertAndBufferData] external error', e);
      }
    })
  }

  /**
   * Process data and use it on chart
   */
  processPlotlyData() {
    const remainingValue = typeof this.chartData['target'] === 'number' && typeof this.chartData['produced'] === 'number' ? this.chartData['target'] - this.chartData['produced'] : '';
    this.chartData['remaining'] = remainingValue;
    const completedPercentage = Object.keys(this.chartData).includes('produced') && Object.keys(this.chartData).includes('target') ? this.calculateCompletionPercentage(this.chartData['target'], this.chartData['produced']) + '%' : '0%';
    this.logger.debug('[processPlotlyData]', {
      remainingValue: remainingValue,
      target: this.chartData['target'],
      produced: this.chartData['produced'],
      values: this.chartData['produced'] && remainingValue ? [this.chartData['produced'], remainingValue] : [0, 100],
      completedPercentage: completedPercentage
    });
    this.graph = {
      data: [
        {
          values: this.chartData['produced'] && remainingValue ? [this.chartData['produced'], remainingValue] : [0, 100],
          labels: this.chartDataLabels,
          type: 'pie',
          marker: {
            colors: this.chartData['produced'] > 0 ? this.chartDataColors : [this.chartDataColors[1], this.chartDataColors[1]],
            line: {
              color: '#00aec5',
              width: [2, 2, 2]
            },
          },
          hole: .4,
          name: null,
          showlegend: false,
          textinfo: 'none',
          textposition: 'inside',
          hovertemplate: '<b>%{label}</b><extra></extra>'
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
              size: 17
            },
            showarrow: false,
            text: completedPercentage,
            x: 0.5,
            y: 0.5
          }
        ]
      },
    };
  }

  /**
   * Calucalte the completion percentage based on total and processed elements
   * @param totalElements 
   * @param producedElements 
   * @returns completition number (percentage)
   */
  calculateCompletionPercentage(totalElements: number, producedElements: number): number {
    if (totalElements <= 0) {
      return 0;
    }
    const completionPercentage = (producedElements / totalElements) * 100;
    return Math.min(Math.round(completionPercentage), 100);
  }

  /**
   * Returns the field name
   * @param fieldId the field's id
   */
  returnFieldName(fieldId: string): string {
    switch (fieldId) {
      case "target":
        return $localize`:@@HYT_target:Target`;
      case "produced":
        return $localize`:@@HYT_produced:Produced`;
      case "current_shift":
        return $localize`:@@HYT_current_shift:Current Shift`;
      case "remaining":
        return $localize`:@@HYT_remaining:Left to Produce`;
      default:
        return;
    }
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
