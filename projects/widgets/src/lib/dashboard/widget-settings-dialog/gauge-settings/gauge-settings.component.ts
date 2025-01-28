import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SelectOption } from 'components';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
  selector: 'hyperiot-gauge-settings',
  templateUrl: './gauge-settings.component.html',
  styleUrls: ['./gauge-settings.component.css']
})
export class GaugeSettingsComponent implements OnInit, OnDestroy {
  subscription: any;
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  @Input() areaId;
  @Input() hDeviceId;
  maxValue: number;
  selectedFields = [];
  private defaultConfig = {
    textColor: '#275691',
    bgColor: 'bright'
  };

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
      Object.assign(this.widget.config, this.defaultConfig);
    }

    this.subscription = this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  apply() {
    this.packetSelect.apply();
  }

  onSelectedFieldsChange(fields) {
    this.selectedFields = fields;
  }

}
