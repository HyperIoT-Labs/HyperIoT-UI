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
  Dashboard
} from '@hyperiot/core';

import { DashboardConfigService } from '../dashboard-config.service';

@Component({
  selector: 'hyt-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.css']
})
export class WidgetsLayoutComponent implements OnInit, OnDestroy {
  @Input() options: GridsterConfig;
  @Input() dashboardId: number | string;

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
    this.configService.getDashboard(+this.dashboardId)
      .subscribe((d) => this.dashboardEntity = d);
    this.configService.getConfig(this.dashboardId).subscribe((dashboardConfig: Array<GridsterItem>) => {
      this.dashboard = dashboardConfig;
      this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
      console.log(this.dashboard);
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
          {outlets: { modal: [ 'settings', data.widget.id ] }}
        ]).then((e) => {
          if (e) {
            //console.log('Navigation is successful!');
          } else {
            //console.log('Navigation has failed!');
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
    if (item.id > 0) {
      this.configService
        .removeDashboardWidget(item.id)
        .subscribe(() => {
          // TODO: handle errors
          this.dashboard.splice(this.dashboard.indexOf(item), 1);
        });
    }
  }

  addItem(widgetTemplate) {
    for (let c = 0; c < widgetTemplate.count; c++) {
      const widget = JSON.parse(JSON.stringify(widgetTemplate));
      delete widget.count;
      this.configService
        .addDashboardWidget(+this.dashboardId, widget)
        .subscribe((w) => {
          // TODO: handle errors
          // widget saved (should have a new id)
          this.dashboard.push(widget);
        });
    }
  }

  saveDashboard() {
    this.configService.putConfig(+this.dashboardId, this.dashboard)
      .subscribe((res) => {
        if (res && res.status_code === 200) {
          this.originalDashboard = this.dashboard;
        }
      });
  }
}
