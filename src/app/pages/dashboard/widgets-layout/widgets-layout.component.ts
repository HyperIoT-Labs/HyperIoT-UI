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
  Dashboard,
  DashboardWidget
} from '@hyperiot/core';

import { DashboardConfigService } from '../dashboard-config.service';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { WidgetSettingsDialogComponent } from '../widget-settings-dialog/widget-settings-dialog.component';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

enum PageStatus {
  Loading = 0,
  Standard = 1,
  New = 2,
  Error = -1
}
@Component({
  selector: 'hyt-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss']
})
export class WidgetsLayoutComponent implements OnInit, OnDestroy {
  @ViewChild(GridsterComponent, { static: true }) gridster: GridsterComponent;
  @ViewChild(WidgetSettingsDialogComponent, { static: true }) widgetSetting: WidgetSettingsDialogComponent;
  @Input() options: GridsterConfig;
  @Input() dashboardValue: Dashboard;

  @Input() widgets;

  dashboard: Array<GridsterItem>;
  dashboardEntity: Dashboard;
  dashboardType: Dashboard.DashboardTypeEnum;
  dragEnabled = true;
  private originalDashboard: Array<GridsterItem>;
  cellSize: number;
  projectId: number;

  currentWidgetIdSetting;

  pageStatus: PageStatus = PageStatus.Loading;

  private removingWidget = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  // private responsiveBreakPoints = [
  //   { breakPoint: 1200, columns: 6, cell: 250},
  //   { breakPoint: 1024, columns: 6, cell: 200},
  //   { breakPoint: 880, columns: 5,cell: 160},
  //   { breakPoint: 720, columns: 4,cell: 160},
  //   { breakPoint: 640, columns: 3,cell: 160},
  //   { breakPoint: 480, columns: 2,cell: 160},
  //   { breakPoint: 0, columns: 1,cell: 160},
  // ];

  autoSaveTimeout;

  changes = 0;

  showSettingWidget = false;

  private responsiveBreakPoints = [
    { breakPoint: 1611, columns: 6, cell: 250},
    { breakPoint: 1610, columns: 6, cell: 200},
    { breakPoint: 1327, columns: 6, cell: 180},
    { breakPoint: 1200, columns: 6, cell: 180},
    { breakPoint: 1024, columns: 4, cell: 230},
    { breakPoint: 880, columns: 4, cell: 190},
    { breakPoint: 720, columns: 3, cell: 210},
    { breakPoint: 640, columns: 2, cell: 270},
    { breakPoint: 480, columns: 2, cell: 200},
    { breakPoint: 400, columns: 1, cell: 170},
    { breakPoint: 0, columns: 1, cell: 120}
  ];

  lastWindowSize;

  /**
   * This is a demo dashboard for testing widgets
   *
   * @param dataStreamService Injected DataStreamService
   * @param httpClient Injected HTTP client
   */
  constructor(
    private dataStreamService: DataStreamService,
    private configService: DashboardConfigService,
    private router: Router,
    private hytModalService: HytModalConfService
  ) { }

  ngOnInit() {
    this.setOptions();

    this.dashboard = [];

    if (this.dashboardValue) {
      this.dashboardEntity = this.dashboardValue;
      this.dashboardType = this.dashboardEntity.dashboardType;
      this.projectId = this.dashboardEntity.hproject.id;
      // connect to data upstream
      this.dataStreamService.connect(this.projectId);
      // get dashboard config

      this.getWidgetsMapped(this.widgets)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (dashboardConfig: Array<GridsterItem>) => {
          this.dashboard = dashboardConfig;
          this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
          this.pageStatus = PageStatus.Standard;
        }
      );

      //  this.configService.getConfig(this.projectId, this.dashboardId)
      //   .pipe(takeUntil(this.ngUnsubscribe))
      //   .subscribe((dashboardConfig: Array<GridsterItem>) => {}
        // this.dashboard = dashboardConfig;
        // console.log(this.dashboard)
        // this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
        // this.pageStatus = PageStatus.Standard;
      // });
    } else {
      console.error('error');
      this.pageStatus = PageStatus.Error;
    }

    // window.onbeforeunload = () => {
    //   this.saveDashboard();
    //   console.log("saviiiing")
    //   // localStorage.setItem("DASHBOARDTOSAVE",this.dashboardId+"_"+JSON.stringify(this.dashboard))
    // };

    window.addEventListener('beforeunload', (e) => {
      this.saveDashboard();
    });
  }

  ngOnDestroy() {

    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }

    this.saveDashboard();

    this.dataStreamService.disconnect();
  }

  setOptions() {
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

    // const cellSize = (availableWidth - (this.options.margin * this.options.maxCols)) / this.options.maxCols;
    // const cellSize = 250;

    this.cellSize = this.getResponsiveCellSize(); /* 160 misura base */
    this.options.fixedColWidth = this.cellSize;
    this.options.fixedRowHeight = this.cellSize / 2;
  }

  getWidgetsMapped(widgets: any): Observable<any> {
    const obs: Observable<any> = new Observable(subscriber => {
      subscriber.next(widgets);
    });

    return obs.pipe(map(
      (data: any[]) => {
        const config = [];
        // Normalize data received from server
        data.map((w: DashboardWidget) => {
            const widget = JSON.parse(w.widgetConf);
            widget.projectId = +this.projectId;
            widget.id = w.id;
            widget.entityVersion = w.entityVersion;
            config.push(widget);
        });
        return config;
      },
      error => console.error(error)
    ));
  }

  activeAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
      this.saveDashboard();
    }, 5000);
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

  onWidgetSettingClose(event) {
    // const widgetId = event.getWidgetId();
    // const widget = this.getItemById(widgetId);
    // event.setWidget(widget);
    this.showSettingWidget = false;
    this.changes++;
    this.activeAutoSave();
    // if(this.ngUnsubscribe)
    //   this.ngUnsubscribe.next();
  }

  onWidgetAction(data) {
    switch (data.action) {
      case 'toolbar:close':
        if (!this.removingWidget) {
          this.removingWidget = true;
          // TODO: should request action confim
          this.removeItem(data.widget, () => {
            this.removingWidget = false;
          });
        }
        break;
      case 'toolbar:settings':
        this.currentWidgetIdSetting = data.widget.id;
        this.showSettingWidget = true;

        const widgetId = this.widgetSetting.getWidgetId();
        const widget = this.getItemById(data.widget.id);
        this.widgetSetting.setWidget(widget);

        this.openModal('hyt-modal-widget-setting');
        // this.router.navigate([
        //   'dashboards',
        //   { outlets: { modal: ['settings', data.widget.id] } }
        // ]).then((e) => {
        //   if (e) {
        //     //console.log('Navigation is successful!');
        //   } else {
        //     //console.log('Navigation has failed!');
        //   }
        // });
        break;
    }
  }

  openModal(id: string) {
    this.hytModalService.open(id);
  }

  closeModal(id: string) {
    this.hytModalService.close(id);
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const columns = this.getResponsiveColumns();
    const cell = this.getResponsiveCellSize();
    if (columns !== this.options.maxCols || cell !== this.options.maxCellSize) {

      if (this.lastWindowSize) {
        clearTimeout(this.lastWindowSize);
      }

      this.pageStatus = PageStatus.Loading;
      this.lastWindowSize = setTimeout(() => {
        this.ngOnInit();
        // this.pageStatus = PageStatus.Standard;
      }, 500);

    }

    // if (columns !== this.options.maxCols || cell !== this.options.maxCellSize) {

    //   // TODO: Angular-Gridster2 won't apply maxCols option on change (bug??)
    //   this.options.maxCols = columns;
    //   if (this.options.maxCols > 1) {
    //     this.options.mobileBreakpoint = 0;
    //   }
    //   this.options.api.optionsChanged();

    // }
  }

  // Gridster events/methods

  onGridSizeChanged(gridster, a, b, c) {
    // TODO: ... this event seems not to be working as expected
  }

  onItemChange(item, itemComponent) {
    this.changes++;
    this.activeAutoSave();
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

  removeItem(item, callback) {
    if (item.id > 0) {
      this.configService
        .removeDashboardWidget(item.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          // TODO: handle errors
          this.dashboard.splice(this.dashboard.indexOf(item), 1);
          if (callback) {
            callback();
          }
        });
    } else if (callback) {
      callback();
    }
  }

  addItem(widgetTemplate) {
    for (let c = 0; c < widgetTemplate.count; c++) {
      const widget = JSON.parse(JSON.stringify(widgetTemplate));
      delete widget.count;
      this.configService
        .addDashboardWidget(+this.dashboardValue.id, widget)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((w) => {
          // TODO: handle errors
          // widget saved (should have a new id)
          widget.projectId = this.projectId;
          this.dashboard.push(widget);
        });
    }
  }

  saveDashboard() {
    this.configService.putConfig(+this.dashboardValue.id, this.dashboard)
    .pipe(takeUntil(this.ngUnsubscribe))
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
      const b = 0;
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
