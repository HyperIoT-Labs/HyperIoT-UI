import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { PacketTableSelectComponent } from '../packet-table-select/packet-table-select.component';

@Component({
  selector: 'hyt-packet-table-settings',
  templateUrl: './packet-table-settings.component.html',
  styleUrls: ['./packet-table-settings.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class PacketTableSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(PacketTableSelectComponent, { static: true }) packetTableSelect: PacketTableSelectComponent;
  subscription: any;
  @Input() modalApply: Observable<any>;
  @Input() widget;
  selectedFields = [];
  private defaultConfig = {
    timeAxisRange: 10,
    maxDataPoints: 100,
    timeWindow: 60,
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

  onSelectedFieldsChange(fields) {
    this.selectedFields = fields;
  }

  apply() {
    this.packetTableSelect.apply();
  }

}

