import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { HPacket, HpacketsService } from 'core';
import { DefibrillatorSettings } from './defibrillator-settings.model';
import { KeyValue } from '@angular/common';

@Component({
    selector: 'hyperiot-defibrillator-settings',
    templateUrl: './defibrillator-settings.component.html',
    styleUrls: ['./defibrillator-settings.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class DefibrillatorSettingsComponent implements OnInit, OnDestroy {
    @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
    colsNumber: number;
    subscription: any;
    derivationsGridLayout = '2:6';
    @Input() modalApply: Observable<any>;
    @Input() widget;
    @Input() areaId;
    @Input() selectedPacket: HPacket = null;

    projectPackets: Array<HPacket> = [];
    visualizationType: string = 'summary';
    visualizationTypes: {} = [
      { label: 'Summary', value: 'summary' },
      { label: 'Standard', value: 'standard' },
      { label: '12 Derivations', value: 'derivations' }
    ];

    DEFAULT_CHANNEL_COLOR = '#FFF';
    fieldTypesDefaultColors: Record<DefibrillatorSettings.Type, string> = {
      [DefibrillatorSettings.Type.ECG]: '#27E527',
      [DefibrillatorSettings.Type.SPO2]: '#00FFFF',
      [DefibrillatorSettings.Type.RESP]: '#FFFF00',
      [DefibrillatorSettings.Type.NIBP]: '#FF0000',
      [DefibrillatorSettings.Type.IBP]: '#FF0000',
      [DefibrillatorSettings.Type.TEMP]: '#FFFFFF',
      [DefibrillatorSettings.Type.CO2]: '#FFFFFF',
      [DefibrillatorSettings.Type.PR]: '#FFFFFF',
    }

    createDefaultChannel(type?: DefibrillatorSettings.Type): DefibrillatorSettings.Channel {
      return {
        type: type ? type : null,
        color: type ? this.fieldTypesDefaultColors[type] : this.DEFAULT_CHANNEL_COLOR,
        min: null,
        max: null,
        value: null,
        unit: null,
      };
    }
    
    createDefaultDefibrillatorSettings(): DefibrillatorSettings.DefibrillatorSettings {
      return {
        standard: {
          standardArea1: {
            channel1: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            channel2: this.createDefaultChannel(),
            channel3: this.createDefaultChannel(),
            channel4: this.createDefaultChannel(),
          },
          parametersArea1: {
            ecgChannel: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
          },
          standardArea2: {
            tempChannel: this.createDefaultChannel(DefibrillatorSettings.Type.TEMP),
            prChannel: this.createDefaultChannel(DefibrillatorSettings.Type.PR),
          },
          standardArea3: {
            nibpChannel: this.createDefaultChannel(DefibrillatorSettings.Type.NIBP),
          },
        },
        derivations: {
          derivationsArea: {
            I: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            II: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            III: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            AVR: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            AVL: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            AVF: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V1: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V2: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V3: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V4: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V5: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
            V6: this.createDefaultChannel(DefibrillatorSettings.Type.ECG),
          }
        },
      };
    }

    defaultDefibrillatorSettings = this.createDefaultDefibrillatorSettings();

    defibrillatorSettings: DefibrillatorSettings.DefibrillatorSettings;

    fieldsTypeOptions: { value: DefibrillatorSettings.Type; label: string; }[] = [ ];

    private defaultConfig = {
        bgColor: 'bright',
        visualizationType: 'standard',
        timeAxisRange: 10,
        // no limits in data points
        maxDataPoints: 0,
        timeWindow: 60,
        refreshIntervalMillis:1000,
        layout: {
            showlegend: true,
            legend: {
                orientation: 'h',
                x: 0.25,
                y: 1,
                traceorder: 'normal',
                font: {
                    family: 'sans-serif',
                    size: 10,
                    color: '#000'
                },
                bgcolor: '#FFFFFF85',
                borderwidth: 0
            }
        }
    };
    dataFrequency = 0.2;
    dataRange = 10;

    constructor(private hPacketsService: HpacketsService) {
      for (const [, type] of Object.entries(DefibrillatorSettings.Type)) {
        this.fieldsTypeOptions.push({
          value: type,
          label: DefibrillatorSettings.Utils.typeLabels[type],
        });
      }
    }

    ngOnInit() {
      if (!this.widget.config || !this.widget.config.layout) {
        this.widget.config = {};
        Object.assign(this.widget.config, this.defaultConfig);
      }

      if (this.widget.config.defibrillator) {
        this.defibrillatorSettings = JSON.parse(JSON.stringify(this.widget.config.defibrillator));
      } else {
        this.defibrillatorSettings = this.defaultDefibrillatorSettings;
      }

      if (this.widget.config.colors == null) {
        this.widget.config.colors = {};
      }

      if (this.widget.cols) {
        this.colsNumber = this.widget.cols;
      }

      if (this.widget.config.internalConfig) {
        this.dataRange = this.widget.config.internalConfig.dataRange;
        this.dataFrequency = this.widget.config.internalConfig.dataFrequency;
        this.visualizationType = this.widget.config.internalConfig.visualizationType;
        if (this.widget.config.internalConfig.derivationsGridLayout) {
          this.derivationsGridLayout =  this.widget.config.internalConfig.derivationsGridLayout.cols + ':' +
            this.widget.config.internalConfig.derivationsGridLayout.rows;
        }
      }
      this.subscription = this.modalApply.subscribe((event) => {
          if (event === 'apply') {
            this.widget.config.internalConfig = {};
            this.widget.config.internalConfig.dataRange = this.dataRange;
            this.widget.config.internalConfig.dataFrequency = this.dataFrequency;
            this.widget.config.internalConfig.visualizationType = this.visualizationType;
            this.widget.config.internalConfig.derivationsGridLayout = {
              cols: +this.derivationsGridLayout.split(':')[0],
              rows: +this.derivationsGridLayout.split(':')[1]
            };
            this.widget.config.maxLogLines = this.dataRange / this.dataFrequency;
            this.widget.config.defibrillator = this.defibrillatorSettings;

            // TODO remove when cols and rows are properly set by BE
            this.widget.cols = 3;
            this.widget.rows = 2;
          }
      });

      this.hPacketsService
      .findAllHPacketByProjectId(this.widget.projectId)
      .subscribe((res) => {
        this.projectPackets = res;
      });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onChangePackets(event) {
      this.widget.config.packets = event;
    }

  // setColsNumber(ev: number) {
  //   this.colsNumber = ev;
  // }

  setFrequency(value) {
    this.dataFrequency = value;
  }

  setTimeRange(value) {
    this.dataRange = value;
  }

  rangeChanged(value) {
    this.visualizationType = value;
  }

  setDerivationsGridLayout(value) {
    this.derivationsGridLayout = value;
  }

  onTypeChanged(channel: DefibrillatorSettings.Channel) {
    // setting default color
    if (channel.type && Object.values(DefibrillatorSettings.Type).includes(channel.type)) {
      channel.color = this.fieldTypesDefaultColors[channel.type];
    } else {
      channel.color =this.DEFAULT_CHANNEL_COLOR;
    }
    this.setParametersArea();
  }
  isFieldDisabled(name: string) {
    return DefibrillatorSettings.Utils.disabledFields.some(x => x.join('-') === name);
  }
  isFieldRequired(name: string) {
    return DefibrillatorSettings.Utils.requiredFields.some(x => x.join('-') === name);
  }

  noOrder<K, V>(a: KeyValue<K, V>, b: KeyValue<K, V>): number {
    return 0;
  }

  standardTypeChannelMap: {
    [key in DefibrillatorSettings.Type]?: string;
  } = {
    ECG: 'ecgChannel',
    RESP: 'respChannel',
    SPO2: 'spo2Channel',
    CO2: 'co2Channel',
    IBP: 'ibpChannel',
  }

  setParametersArea() {
    // removing old types
    const parameterChannels = this.defibrillatorSettings.standard.parametersArea1;
    for (let key in parameterChannels) {
      if (parameterChannels.hasOwnProperty(key) && !Object.values(this.defibrillatorSettings.standard.standardArea1).some(chartChannel => chartChannel.type === parameterChannels[key].type)) {
        delete parameterChannels[key];
      }
    }

    // adding new type
    Object.values(this.defibrillatorSettings.standard.standardArea1).forEach(chartChannel => {
      if (!chartChannel.type) {
        return;
      }
      if (!this.defibrillatorSettings.standard.parametersArea1[this.standardTypeChannelMap[chartChannel.type]]) {
        if (this.standardTypeChannelMap[chartChannel.type]) {
          this.defibrillatorSettings.standard.parametersArea1[this.standardTypeChannelMap[chartChannel.type]] = this.createDefaultChannel(chartChannel.type);
        }
      }
    });
  }

  isStandardArea1Sorted() {
    const chartsArray = Object.values(this.defibrillatorSettings.standard.standardArea1);
    const types = Array.from(chartsArray.map(chart => chart.type));
    for (let i = 0; i < types.length; i++) {
      const chartsByType = chartsArray.filter(chart => chart.type === types[i]);
      const chartsByTypeIndexes = chartsByType.map(chart => chartsArray.indexOf(chart));
      for (let j = 1; j < chartsByTypeIndexes.length; j++) {
        if (chartsByTypeIndexes[j] !== chartsByTypeIndexes[j - 1] + 1) {
          return false;
        }
      }
    }
    return true;
  }
}
