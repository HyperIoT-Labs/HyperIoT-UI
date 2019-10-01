import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

import { Subject } from 'rxjs';

@Component({
  selector: 'hyt-stats-chart-settings',
  templateUrl: './stats-chart-settings.component.html',
  styleUrls: ['./stats-chart-settings.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class StatsChartSettingsComponent implements OnInit, OnDestroy {
  @Input() modalApply: Subject<any>;
  @Input() widget;
  dataUrl: string;
  dataTableUrl: string;
  private defaultConfig = {
    data: [],
    layout: {
      xaxis: {
        tickangle: -45
      }
    }
  };

  constructor(public settingsForm: NgForm) { }

  ngOnInit() {
    if (this.widget.config.data == null || this.widget.config.data.length === 0) {
      Object.assign(this.widget.config, this.defaultConfig);
    }
    this.dataUrl = this.widget.dataUrl;
    this.dataTableUrl = this.widget.dataTableUrl;
    this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }

  ngOnDestroy() {
    // this.modalApply.unsubscribe();
  }

  apply() {
    this.widget.dataUrl = this.dataUrl;
    this.widget.dataTableUrl = this.dataTableUrl;
  }
}
