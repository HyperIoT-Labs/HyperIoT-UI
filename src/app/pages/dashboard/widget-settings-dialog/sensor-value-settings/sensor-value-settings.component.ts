import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { PacketSelectComponent } from '../packet-select/packet-select.component';

@Component({
  selector: 'hyt-sensor-value-settings',
  templateUrl: './sensor-value-settings.component.html',
  styleUrls: ['./sensor-value-settings.component.css']
})
export class SensorValueSettingsComponent implements OnInit, OnDestroy {
  subscription: any;
  @ViewChild(PacketSelectComponent, { static: true }) packetSelect: PacketSelectComponent;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  @Input() areaId;
  selectedFields = [];
  private defaultConfig = {};

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
    if (this.widget.config == null) {
      this.widget.config = {};
    }

    if (this.widget.config.seriesConfig == null || this.widget.config.seriesConfig.length === 0) {
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
