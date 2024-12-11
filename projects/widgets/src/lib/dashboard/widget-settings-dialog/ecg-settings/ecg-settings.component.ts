import {Component, OnInit, ViewChild, Input, OnDestroy} from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';
import { SelectOption } from 'components';

@Component({
    selector: 'hyperiot-ecg-settings',
    templateUrl: './ecg-settings.component.html',
    styleUrls: ['./ecg-settings.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EcgSettingsComponent implements OnInit, OnDestroy {
    @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
    colsNumber: number;
    subscription: any;
    @Input() modalApply: Observable<any>;
    @Input() widget;
    @Input() areaId;
    @Input() hDeviceId;
    selectedFields = [];
    private defaultConfig = {
      bgColor: 'bright',
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
    dataRange = 30;

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

    constructor(public settingsForm: NgForm) { }

    ngOnInit() {
        if (this.widget.config == null) {
            this.widget.config = {};
        }

        if (this.widget.config.colors == null) {
          this.widget.config.colors = {};
        }

        if (!this.widget.config) {
            Object.assign(this.widget.config, this.defaultConfig);
        }

        if (this.widget.cols) {
          this.colsNumber = this.widget.cols;
        }
        if (this.widget.config.internalConfig) {
          this.dataRange = this.widget.config.internalConfig.dataRange;
          this.dataFrequency = this.widget.config.internalConfig.dataFrequency;
        }
        this.subscription = this.modalApply.subscribe((event) => {
            if (event === 'apply') {
              this.widget.config.internalConfig = {};
              this.widget.config.internalConfig.dataRange = this.dataRange;
              this.widget.config.internalConfig.dataFrequency = this.dataFrequency;
              this.widget.config.maxLogLines = this.dataRange / this.dataFrequency;
              if (this.packetSelect.selectedFields.length > 0) {
                this.widget.rows = this.packetSelect.selectedFields.length * 4;
                this.widget.cols = this.colsNumber;
              } else {
                this.widget.cols = this.colsNumber;
              }
              this.apply();
            }
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

    onSelectedFieldsChange(fields) {
        this.selectedFields = fields;
    }

    apply() {
        this.packetSelect.apply();
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
}
