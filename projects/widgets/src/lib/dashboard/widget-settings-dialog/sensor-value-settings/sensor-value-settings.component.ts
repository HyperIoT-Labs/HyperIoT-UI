import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SelectOption } from 'components';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'hyperiot-sensor-value-settings',
  templateUrl: './sensor-value-settings.component.html',
  styleUrls: ['./sensor-value-settings.component.css']
})
export class SensorValueSettingsComponent implements OnInit, OnDestroy {
  subscription: any;
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  @Input() areaId;
  @Input() hDeviceId;
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

  constructor(public settingsForm: NgForm, private activatedRoute: ActivatedRoute) { }

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
