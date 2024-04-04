import { Component, Injector, OnInit } from '@angular/core';
import { DataChannel, DataPacketFilter, Logger, LoggerService, PacketData } from 'core';
import { Subscription } from 'rxjs';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { HytBadgeShape, HytBadgeSize } from 'components';
@Component({
  selector: 'hyperiot-production-target',
  templateUrl: './production-target.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './production-target.component.scss']
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
  chartDataColors: string[] = ['#0956b6', '#ffffff'];

  /**
   * Filled with labels on data channel data retrieval, starts with remaining since it's a value we extrapolate from target - produced
   */
  widgetLabels = [
    { label: "target", value: "target" },
    { label: "current_shift", value: "current_shift" },
    { label: "produced", value: "produced" },
    { label: "remaining", value: "remaining" }
  ];

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
      this.widgetLabels = [
        { label: "target", value: "target" },
        { label: "current_shift", value: "current_shift" },
        { label: "produced", value: "produced" },
        { label: "remaining", value: "remaining" }
      ];
      if (this.widget.config.productionTargetSettings.target.isTargetManuallySet) {
        this.chartData['target'] = this.widget.config.productionTargetSettings.target.manuallySetField.targetManuallySetValue;
      };
      Object.keys(this.widget.config.productionTargetSettings).map(key => {
        if ((key === 'target' && (this.widget.config.productionTargetSettings[key].dynamicallySetField?.fieldAlias || this.widget.config.productionTargetSettings[key].manuallySetField?.fieldAlias)) || (key !== 'target' && this.widget.config.productionTargetSettings[key].fieldAlias)) {
          const labelIndex = this.widgetLabels.findIndex(item => item.value === key);
          if (labelIndex !== -1) {
            if (key === 'remaining') {
              this.widgetLabels[labelIndex].label = this.widget.config.productionTargetSettings[key].fieldAlias;
            } else if (key === 'target') {
              if (this.widget.config.productionTargetSettings[key].isTargetManuallySet) {
                this.widgetLabels[labelIndex].label = this.widget.config.productionTargetSettings.target.manuallySetField.fieldAlias;
              } else {
                this.widgetLabels[labelIndex].label = this.widget.config.productionTargetSettings[key].dynamicallySetField.fieldAlias;
              }
            } else {
              this.widgetLabels[labelIndex].label = this.widget.config.productionTargetSettings[key].fieldAlias;
            }
          }
        }

        if ((key === 'target' && !this.widget.config.productionTargetSettings.target.isTargetManuallySet) || (key !== 'target' && this.widget.config.productionTargetSettings[key].packet && this.widget.config.productionTargetSettings[key].field)) {
          let packetId = this.widget.config.productionTargetSettings[key].packet;
          let field = this.widget.config.productionTargetSettings[key].field;
          
          if (key === 'target') {
            packetId = this.widget.config.productionTargetSettings[key].dynamicallySetField.packet;
            field = this.widget.config.productionTargetSettings[key].dynamicallySetField.field;
            this.chartData['target'] = null;
          }
          const fieldValue = { [field.fieldId[0]]: field.fieldName };
          if (packetAndFieldsToRetrive[parseInt(packetId)]) {
            packetAndFieldsToRetrive[parseInt(packetId)] = { ...packetAndFieldsToRetrive[parseInt(packetId)], ...fieldValue };
          } else {
            packetAndFieldsToRetrive[parseInt(packetId)] = fieldValue;
          }
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
            const chartKeys = Object.keys(this.widget.config.productionTargetSettings).filter(fieldKey => {
              if (fieldKey === 'remaining') {
                return true;
              } else if (fieldKey === 'current_shift' && !this.widget.config.productionTargetSettings[fieldKey].field) {
                return false;
              } else if (fieldKey === 'target' && this.widget.config.productionTargetSettings[fieldKey].isTargetManuallySet) {
                return false;
              } else if (fieldKey === 'target' && !this.widget.config.productionTargetSettings[fieldKey].isTargetManuallySet) {
                return this.widget.config.productionTargetSettings[fieldKey].dynamicallySetField.field['fieldName'] === key;
              } else {
                return this.widget.config.productionTargetSettings[fieldKey].field.fieldName === key;
              }
            })
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
    const targetValue = typeof this.chartData['target'] === 'number' ? this.chartData['target'] : parseInt(this.chartData['target']);
    const remainingValue = typeof targetValue === 'number' && typeof this.chartData['produced'] === 'number' ? targetValue - this.chartData['produced'] : null;
    this.chartData['remaining'] = remainingValue;
    const completedPercentage = Object.keys(this.chartData).includes('produced') && Object.keys(this.chartData).includes('target') ? this.calculateCompletionPercentage(this.chartData['target'], this.chartData['produced']) : 0;
    const chartDataValues = this.chartData['produced'] && typeof remainingValue === 'number' && remainingValue >= 0 ? [this.chartData['produced'], remainingValue] : [0, 100];
    this.logger.debug('[processPlotlyData]', {
      remainingValue: this.chartData['remaining'],
      target: this.chartData['target'],
      produced: this.chartData['produced'],
      values: chartDataValues,
      completedPercentage: completedPercentage
    });
    let chartColors = this.chartDataColors;
    if (this.chartData['produced'] === 0 || remainingValue === 0 || completedPercentage > 100) {
      if (this.chartData['produced'] === 0) {
        chartColors = [this.chartDataColors[1], this.chartDataColors[1]];
      } else {
        chartColors = [this.chartDataColors[0], this.chartDataColors[0]];
      }
    }
    this.graph = {
      data: [
        {
          values: chartDataValues,
          labels: this.chartDataLabels,
          type: 'pie',
          marker: {
            colors: chartColors,
            line: {
              color: '#0956b6',
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
        autosize: true,
        width: '150',
        height: '150',
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
            text: completedPercentage + '%',
            x: 0.5,
            y: 0.5
          }
        ]
      },
      config: {
        responsive: true
      }
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
    return Math.min(Math.round(completionPercentage));
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
        return fieldId;
    }
  }

  get badgeShape(): HytBadgeShape{
    return HytBadgeShape.PILLS;
  }
  get badgeSize(): HytBadgeSize{
    return HytBadgeSize.XSMALL;
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
