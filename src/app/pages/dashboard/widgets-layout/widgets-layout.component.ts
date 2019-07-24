import { Component, OnInit, Input } from '@angular/core';

import { GridsterConfig, GridsterItem, GridType, DisplayGrid, CompactType } from 'angular-gridster2';

import { DataStreamService } from '@hyperiot/core';
import { DashboardConfigService } from '../dashboard-config.service';

@Component({
  selector: 'hyt-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss']
})
export class WidgetsLayoutComponent implements OnInit {

  @Input() options: GridsterConfig;

  dragEnabled = true;
  dashboard: Array<GridsterItem>;
  @Input() dashboardId: string;
  private originalDashboard: Array<GridsterItem>;

  constructor(
    private dataStreamService: DataStreamService,
    private configService: DashboardConfigService
  ) { }

  ngOnInit() {
    this.options = {
      itemChangeCallback: this.onItemChange.bind(this),
      itemResizeCallback: this.onItemResize.bind(this),
      gridType: GridType.Fit,
      compactType: CompactType.CompactUp,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      scrollToNewItems: false,
      disableWarnings: true,
      ignoreMarginInRow: false,
      minCols: 8,
      maxCols: 8,
      minRows: 4,
      maxRows: 100,
      draggable: {
        enabled: this.dragEnabled,
        dropOverItems: true,
        dragHandleClass: 'drag-handle',
        ignoreContent: true
      },
      swap: false,
      disableScrollHorizontal: true,
      disableScrollVertical: false,
      pushItems: true,
      resizable: {
        enabled: false
      }
    };

    this.dashboard = [];
    this.configService.getConfig(this.dashboardId).subscribe((dashboardConfig: Array<GridsterItem>) => {
      this.dashboard = dashboardConfig;
      this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
    });
    // TODO: the connection should happen somewhere else in the main page
    this.dataStreamService.connect();
  }

  onToggleDragging() {
    this.dragEnabled = !this.dragEnabled;
    this.options.draggable.enabled = this.dragEnabled;
    this.options.api.optionsChanged();
  }

  isDirty() {
    return JSON.stringify(this.dashboard) !== JSON.stringify(this.originalDashboard);
  }

  // Gridster methods

  onItemChange(item, itemComponent) {
    if (typeof item.change === 'function') {
      item.change();
    }
  }

  onItemResize(item, itemComponent) {
    if (typeof item.resize === 'function') {
      item.resize();
    }
  }

  changedOptions() {
    this.options.api.optionsChanged();
  }

  removeItem(item) {
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItem(widget) {
    this.dashboard.push(widget);
  }

  saveDashboard() {
    this.configService.putConfig(this.dashboardId, this.dashboard)
      .subscribe((res) => console.log(res));
  }

}
