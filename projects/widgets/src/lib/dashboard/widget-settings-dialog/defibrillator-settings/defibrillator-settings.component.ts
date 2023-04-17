import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { SelectOption } from 'components';
import { HPacket, HpacketsService } from 'core';
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
    visualizationType: string = 'standard';
    visualizationTypes: {} = [
      { label: 'Standard', value: 'standard' },
      { label: '12 Derivations', value: 'derivations' }
    ];

    areas: Array <string> = ['standardArea1', 'standardArea2', 'standardArea3'];

    channels: any = {
      standardArea1: {
        label: 'Waveform area',
        repetition: 4
      },
      standardArea2: {
        label: 'Parameters area',
        repetition: 2
      },
      standardArea3: {
        label: 'Parameters area',
        repetition: 1
      },
      derivations: {
        label: 'Derivations area',
        repetition: 12
      }
    };

    fieldsTypeOptions: SelectOption[] = [
      {
        value: 'ecg',
        label: 'ECG'
      },
      {
        value: 'temp',
        label: 'TEMP'
      },
      {
        value: 'resp',
        label: 'RESP'
      },
      {
        value: 'spo2',
        label: 'SPO2'
      },
      {
        value: 'nibp',
        label: 'NIBP'
      },
      {
        value: 'ibp',
        label: 'IBP'
      },
      {
        value: 'co2',
        label: 'CO2'
      },
      {
        value: 'pr',
        label: 'PR'
      }
    ];
    fieldTypesColors: {} = {
      ecg: '#32CD32',
      spo2: '#00FFFF',
      resp: '#FFFF00',
      nibp: '#FF0000',
      ibp: '#FF0000',
      temp: '#FFFFFF',
      co2: '#FFFFFF',
      pr: '#FFFFFF'
    }
    selectedColors: any = {
      standardArea1: ['#32CD32','#FFFFFF', '#FFFFFF','#FF0000'],
      standardArea2: ['#32CD32','#FFFFFF'],
      standardArea3: ['#32CD32'],
      derivations: ['#32CD32']
    };

    derivationsLabels: Array<string> = ['I', 'II', 'III', 'AVR', 'AVL', 'AVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

    selectedTypeOption: object = {
      standardArea1: ['','','',''],
      standardArea2: ['',''],
      standardArea3: [''],
      derivations: []
    };
    paramsToSet: any = [];
    selectedPacketFields: any = {
      standardArea1: ['','','',''],
      parametersArea1: {},
      standardArea2: ['',''],
      standardArea3: [''],
      derivations: []
    };

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

    bgColorOptions: SelectOption[] = [
      {
        value: 'bright',
        label: $localize`:@@HYT_widget_settings_bg_color_bright:Bright`
      },
      {
        value: 'dark',
        label: $localize`:@@HYT_widget_settings_bg_color_dark:Dark`
      }
    ];

    constructor(private hPacketsService: HpacketsService, public settingsForm: NgForm) { }

    ngOnInit() {
      if (!this.widget.config || !this.widget.config.layout) {
        this.widget.config = {};
        Object.assign(this.widget.config, this.defaultConfig);
      }

      if (this.widget.config.defibrillator) {
        this.selectedTypeOption = {};
        this.selectedColors = {};
        Object.keys(this.channels).forEach(channel => {
          this.selectedTypeOption[channel] = this.widget.config.defibrillator[channel].types;
          if (channel === 'standardArea1') {
            this.selectedPacketFields['parametersArea1'] = {...this.widget.config.defibrillator[channel].parametersPacketField};
            this.paramsToSet = Object.keys(this.selectedPacketFields['parametersArea1']);
          }
          this.selectedPacketFields[channel] = this.widget.config.defibrillator[channel].packetField;
          this.selectedColors[channel] = this.widget.config.defibrillator[channel].colors;
        })
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
            this.widget.config.defibrillator = {}
            Object.keys(this.channels).forEach(channel => {
              this.widget.config.defibrillator[channel] = { 
                types: this.selectedTypeOption[channel],
                packetField: this.selectedPacketFields[channel],
                colors: this.selectedColors[channel]
              };
              if (channel === 'standardArea1') {
                this.widget.config.defibrillator[channel].parametersPacketField = this.selectedPacketFields['parametersArea1'];
              }
            })
            this.widget.cols = this.colsNumber;
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

  setColsNumber(ev: number) {
    this.colsNumber = ev;
  }

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

  updateTypeInfo(area, i, value) {
    this.selectedColors[area][i] = this.fieldTypesColors[value];
    if (area !== 'standardArea1') { return }
    this.paramsToSet = this.paramsToSet.filter(param => this.selectedTypeOption[area].find(ele => ele === param));
    const keyToDelete = Object.keys(this.selectedPacketFields['parametersArea1']).filter(x => !this.paramsToSet.includes(x))
    delete this.selectedPacketFields['parametersArea1'][keyToDelete[0]];
    if (value === 'ecg' || value === 'spo2' || value === 'resp') {
      if (!this.paramsToSet.find(param => param === value)) {
        this.paramsToSet.push(value);
      }
    }
  }
}
