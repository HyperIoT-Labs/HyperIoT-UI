import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'hyt-stats-chart-settings',
  templateUrl: './stats-chart-settings.component.html',
  styleUrls: ['./stats-chart-settings.component.css']
})
export class StatsChartSettingsComponent implements OnInit, OnDestroy {
  @Input() modalApply: Subject<any>;
  @Input() widget;

  ngOnInit() {
    this.modalApply.subscribe((event) => {
      if (event === 'apply') {
        this.apply();
      }
    });
  }
  ngOnDestroy() {
    this.modalApply.unsubscribe();
  }

  apply() {
    // TODO: ...
  }
}
