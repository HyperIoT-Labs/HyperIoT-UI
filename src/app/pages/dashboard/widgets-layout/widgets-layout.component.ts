import { Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import {
  GridsterConfig,
  GridsterItem,
  GridType,
  DisplayGrid,
  CompactType,
  GridsterComponent
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
  @ViewChild(GridsterComponent, { static: true }) gridster: GridsterComponent;
  @Input() options: GridsterConfig;
  @Input() dashboardId: number | string;

  dashboard: Array<GridsterItem>;
  dashboardEntity: Dashboard;
  dragEnabled = true;
  private originalDashboard: Array<GridsterItem>;
  cellSize: number;
  projectId: number;

  // private responsiveBreakPoints = [
  //   { breakPoint: 1200, columns: 6, cell: 250},
  //   { breakPoint: 1024, columns: 6, cell: 200},
  //   { breakPoint: 880, columns: 5,cell: 160},
  //   { breakPoint: 720, columns: 4,cell: 160},
  //   { breakPoint: 640, columns: 3,cell: 160},
  //   { breakPoint: 480, columns: 2,cell: 160},
  //   { breakPoint: 0, columns: 1,cell: 160},
  // ];

  private responsiveBreakPoints = [
    { breakPoint: 1611, columns: 6, cell: 250},
    { breakPoint: 1610, columns: 6, cell: 200},
    { breakPoint: 1327, columns: 6, cell: 180},
    { breakPoint: 1200, columns: 6, cell: 180},
    { breakPoint: 1024, columns: 4, cell: 230},
    { breakPoint: 880, columns: 4,cell: 190},
    { breakPoint: 720, columns: 3,cell: 210},
    { breakPoint: 640, columns: 2,cell: 270},
    { breakPoint: 480, columns: 2,cell: 200},
    { breakPoint: 400, columns: 1,cell: 170},
    { breakPoint: 0, columns: 1,cell: 120}
  ];

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
      gridSizeChangedCallback: this.onGridSizeChanged.bind(this),
      itemChangeCallback: this.onItemChange.bind(this),
      itemResizeCallback: this.onItemResize.bind(this),
      gridType: GridType.Fixed,
      setGridSize: true,
      compactType: CompactType.CompactUp,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: true,
      disableAutoPositionOnConflict: false,
      scrollToNewItems: true,
      disableWarnings: true,
      ignoreMarginInRow: false,
      mobileBreakpoint: 400,
      keepFixedHeightInMobile: true,
      keepFixedWidthInMobile: false,
      minCols: 1, maxCols: 10, maxCellsize: 280,
      minRows: 1,
      margin: 6,
      draggable: {
        enabled: this.dragEnabled,
        dropOverItems: true,
        dragHandleClass: 'drag-handle',
        ignoreContent: true
      },
      swap: false,
      disableScrollHorizontal: true,
      disableScrollVertical: true,
      pushItems: true,
      resizable: {
        enabled: false
      }
    };

    this.options.maxCols = this.getResponsiveColumns();
    this.options.maxCellSize = this.getResponsiveCellSize();

    if (this.options.maxCols > 1) {
      this.options.mobileBreakpoint = 0;
    }

    //const cellSize = (availableWidth - (this.options.margin * this.options.maxCols)) / this.options.maxCols;
    // const cellSize = 250;

    this.cellSize = this.getResponsiveCellSize(); /* 160 misura base */
    this.options.fixedColWidth = this.cellSize;
    this.options.fixedRowHeight = this.cellSize / 2;

    this.dashboard = [];
    this.configService.getDashboard(+this.dashboardId)
    .subscribe(
      (d) => {
        this.dashboardEntity = d;
        this.projectId = this.dashboardEntity.hproject.id;
        // connect to data upstream
        this.dataStreamService.connect(this.projectId);
        // get dashboard config
        this.configService.getConfig(this.projectId, this.dashboardId).subscribe((dashboardConfig: Array<GridsterItem>) => {
          this.dashboard = dashboardConfig;
          this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
        });
      }
    );
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
        console.log("aaaaa")
        this.router.navigate([
          'dashboards',
          { outlets: { modal: ['settings', data.widget.id] } }
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const columns = this.getResponsiveColumns();
    const cell = this.getResponsiveCellSize();

    if (columns !== this.options.maxCols || cell !== this.options.maxCellSize) {
      /*
      // TODO: Angular-Gridster2 won't apply maxCols option on change (bug??)
      this.options.maxCols = columns;
      if (this.options.maxCols > 1) {
        this.options.mobileBreakpoint = 0;
      }
      this.options.api.optionsChanged();
      */
      // the following is a work around for the above issue (forcing component reload)
      let currentRouteUrl = this.router.url;
      if (currentRouteUrl.indexOf('/(') > 0) {
        currentRouteUrl = currentRouteUrl.substring(0, currentRouteUrl.indexOf('/('));
      }
      const parentRouteUrl = currentRouteUrl.substring(0, currentRouteUrl.lastIndexOf('/'));
      this.router.navigateByUrl(
        parentRouteUrl, { skipLocationChange: true }
      ).then(() => this.router.navigate([currentRouteUrl]));
    }
  }

  // Gridster events/methods

  onGridSizeChanged(gridster, a, b, c) {
    // TODO: ... this event seems not to be working as expected
  }

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
          widget.projectId = this.projectId;
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

  getResponsiveColumns(): number {
    let columns = 8;
    const availableWidth = document.documentElement.clientWidth;
    if (availableWidth <= this.options.mobileBreakpoint) {
      columns = 1;
    } else {
      let b = 0;
      const bp = this.responsiveBreakPoints.find((p) => p.breakPoint <= availableWidth);
      if (bp) {
        columns = bp.columns;
      }
    }
    return columns;
  }

  getResponsiveCellSize(): number {
    let singleCell = 160;

    const availableWidth = document.documentElement.clientWidth;
    if (availableWidth <= this.options.mobileBreakpoint) {
      singleCell = singleCell;
    } else {
      const bp = this.responsiveBreakPoints.find((p) => p.breakPoint <= availableWidth);
      if (bp) {
        singleCell = bp.cell;
      }
    }

    return singleCell;
  }

}
