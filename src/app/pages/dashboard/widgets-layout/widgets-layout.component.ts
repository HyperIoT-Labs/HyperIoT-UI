import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import {
  GridsterConfig,
  GridsterItem,
  GridType,
  DisplayGrid,
  CompactType
} from 'angular-gridster2';

import {
  DataStreamService,
  DashboardwidgetsService,
  DashboardWidget,
  Dashboard,
  DashboardsService
} from '@hyperiot/core';

import { DashboardConfigService } from '../dashboard-config.service';

@Component({
  selector: 'hyt-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.css']
})
export class WidgetsLayoutComponent implements OnInit, OnDestroy {
  @Input() options: GridsterConfig;
  @Input() dashboardId: string;

  dashboard: Array<GridsterItem>;
  dashboardEntity: Dashboard;
  dragEnabled = true;
  private originalDashboard: Array<GridsterItem>;

  /**
   * This is a demo dashboard for testing widgets
   *
   * @param dataStreamService Injected DataStreamService
   * @param httpClient Injected HTTP client
   */
  constructor(
    private dataStreamService: DataStreamService,
    private configService: DashboardConfigService,
    private dashboardService: DashboardsService,
    private dashboardWidgetService: DashboardwidgetsService,
    private router: Router
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
    this.dashboardService.findDashboard(+this.dashboardId)
      .subscribe((d) => this.dashboardEntity = d);
    this.configService.getConfig(this.dashboardId).subscribe((dashboardConfig: Array<GridsterItem>) => {
      this.dashboard = dashboardConfig;
      this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
    });
    // TODO: the connection should happen somewhere else in the main page
    this.dataStreamService.connect();
  }
  ngOnDestroy() {
    this.dataStreamService.disconnect();
  }

  onToggleDragging() {
    this.dragEnabled = !this.dragEnabled;
    this.options.draggable.enabled = this.dragEnabled;
    this.options.api.optionsChanged();
  }

  isDirty() {
    return false;
    // TODO: fix this
    // return this.originalDashboard && JSON.stringify(this.dashboard) !== JSON.stringify(this.originalDashboard);
  }

  // Widget events

  onWidgetAction(data) {
    console.log('Widget action...', data);
    switch (data.action) {
      case 'toolbar:close':
        // TODO: should request action confim
        this.removeItem(data.widget);
        break;
      case 'toolbar:settings':
        this.router.navigate([
          'dashboards',
          this.dashboardId,
          { outlets: { modal: ['settings', data.widget.id] } }
        ]).then((e) => {
          if (e) {
            console.log('Navigation is successful!');
          } else {
            console.log('Navigation has failed!');
          }
        });
        break;
    }
  }

  // Gridster events/methods

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

  getItemById(id: string) {
    return this.dashboard.find((w) => w.id === +id);
  }

  removeItem(item) {
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
    if (item.id > 0) {
      this.dashboardWidgetService.deleteDashboardWidget(item.id)
        .subscribe();
    }
  }

  addItem(widget) {
    const count = widget.count;
    delete widget.count;
    for (let c = 0; c < count; c++) {
      this.dashboard.push(widget);
      const dashboardWidget: DashboardWidget = {
        widgetId: widget.widgetId,
        widgetConf: JSON.stringify(widget),
        dashboard: { id: +this.dashboardId }
      };
      this.dashboardWidgetService.saveDashboardWidget(dashboardWidget)
        .subscribe((w) => {
          // update new widget id
          widget.id = w.id;
          widget.widgetId = `widget-${w.id}`;
        });
    }
  }

  saveDashboard() {
    this.configService.putConfig(this.dashboardId, this.dashboard)
      .subscribe((res) => {
        console.log('saveDashboard output', res);
        if (res && res.status_code === 200) {
          this.originalDashboard = this.dashboard;
        }
      });
  }
}
