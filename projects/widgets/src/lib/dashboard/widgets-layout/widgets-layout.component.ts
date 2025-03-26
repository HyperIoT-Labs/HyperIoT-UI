import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  CompactType,
  DisplayGrid,
  GridType,
  GridsterComponent,
  GridsterConfig,
  GridsterItem
} from 'angular-gridster2';

import {
  Dashboard,
  DashboardWidget,
  HPacket,
  PacketData,
  RealtimeDataService,
} from 'core';

import { ConfirmDialogService, DialogService } from 'components';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { WidgetAction, WidgetConfig } from '../../base/base-widget/model/widget.model';
import { ServiceType } from '../../service/model/service-type';
import { DashboardConfigService } from '../dashboard-config.service';
import { WidgetSelection } from '../model/dashboard.model';
import { WidgetFullscreenDialogComponent } from '../widget-fullscreen-dialog/widget-fullscreen-dialog.component';
import { WidgetSettingsDialogComponent } from '../widget-settings-dialog/widget-settings-dialog.component';

enum PageStatus {
  Loading = 0,
  Standard = 1,
  New = 2,
  Error = -1
}
@Component({
  selector: 'hyperiot-dashboard-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class WidgetsDashboardLayoutComponent implements OnInit, OnDestroy {
  widgetReadyCounter = 0;

  @ViewChild('gridster') gridster: GridsterComponent;

  @ViewChild(WidgetSettingsDialogComponent, { static: true }) widgetSetting: WidgetSettingsDialogComponent;
  @Input() options: GridsterConfig;
  @Input() dashboardValue: Dashboard;

  @Input() widgets: string | any[];

  @Output() widgetLayoutEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() topologyResTimeChange: EventEmitter<any> = new EventEmitter<any>();

  dashboard: Array<GridsterItem>;
  dashboardEntity: Dashboard;
  dashboardType: Dashboard.DashboardTypeEnum;
  dragEnabled = true;
  private originalWidgetsPosition: { id: string, x: number, y: number }[] = [];

  cellSize: number;
  projectId: number;

  currentWidgetIdSetting;

  pageStatus: PageStatus = PageStatus.Loading;

  serviceType = ServiceType;

  private removingWidget = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  /** Topology healt status monitor */
  public TOPOLOGY_NOT_RESPONDING = -1;
  private streamSubscription: Subscription;
  private topologyResponseTimeMs: number = this.TOPOLOGY_NOT_RESPONDING;

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
    { breakPoint: 1611, columns: 6, cell: 250 },
    { breakPoint: 1610, columns: 6, cell: 200 },
    { breakPoint: 1327, columns: 6, cell: 180 },
    { breakPoint: 1200, columns: 6, cell: 180 },
    { breakPoint: 1024, columns: 4, cell: 230 },
    { breakPoint: 880, columns: 4, cell: 190 },
    { breakPoint: 720, columns: 3, cell: 210 },
    { breakPoint: 640, columns: 2, cell: 270 },
    { breakPoint: 480, columns: 2, cell: 200 },
    { breakPoint: 400, columns: 1, cell: 170 },
    { breakPoint: 0, columns: 1, cell: 120 }
  ];

  lastWindowSize;

  /**
   * This is a demo dashboard for testing widgets
   *
   * @param dataStreamService Injected DataStreamService
   * @param configService
   * @param activatedRoute
   * @param dialogService
   * @param toastr
   */
  constructor(
    private realtimeDataService: RealtimeDataService,
    private configService: DashboardConfigService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.setOptions();

    this.dashboard = [];

    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = null;
    }

    this.configService.getDashboard(+this.dashboardValue?.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (d) => {
          this.dashboardEntity = d;

          this.dashboardType = this.dashboardEntity.dashboardType;
          this.projectId = this.dashboardEntity.hproject.id;
          this.streamSubscription = this.realtimeDataService.eventStream.subscribe((p) => {

            const packet = p.data;
            const remoteTimestamp: number = this.getTimestampFieldValue(packet);
            this.topologyResTimeChange.emit({ timeMs: remoteTimestamp });
          });
          // get dashboard config
          this.getWidgetsMapped(d.widgets)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (dashboardConfig: any[]) => {
                // dashboardConfig.sort((a, b) => a.y - b.y);

                console.log(dashboardConfig);

                this.dashboard = [...dashboardConfig];

                this.originalWidgetsPosition = dashboardConfig.map(({ id, x, y }) => ({ id, x, y }));
                console.log(this.originalWidgetsPosition );

                this.pageStatus = PageStatus.Standard;
              }
            });
        },
        error => {
          console.error(error);
          this.pageStatus = PageStatus.Error;
        }
      );

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

    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }

    this.saveDashboard();
  }

  setOptions() {
    this.options = {
      gridSizeChangedCallback: this.onGridSizeChanged.bind(this),
      itemChangeCallback: this.onItemChange.bind(this), // callback to call for each item when is changes x, y, rows, cols.
      itemResizeCallback: this.onItemResize.bind(this), // callback to call for each item when width/height changes.
      gridType: GridType.Fixed, //'fixed' will set the rows and columns dimensions based on fixedColWidth and fixedRowHeight options
      setGridSize: true,
      compactType: CompactType.CompactUp, // compact items: 'none' | 'compactUp' | 'compactLeft' | 'compactUp&Left' | 'compactLeft&Up'
      displayGrid: DisplayGrid.Always,
      disableWindowResize: false, // disable the window on resize listener. This will stop grid to recalculate on window resize
      disableAutoPositionOnConflict: false,
      scrollToNewItems: true,
      disableWarnings: true,
      ignoreMarginInRow: false,
      mobileBreakpoint: 0, // if the screen is not wider that this, remove the grid layout and stack the items
      keepFixedHeightInMobile: true, // keep the height from fixed gridType in mobile layout
      keepFixedWidthInMobile: false, // keep the width from fixed gridType in mobile layout
      minCols: 1, // minimum amount of columns in the grid

      // maxCols is set to 6 (max value in responsiveBreakPoints) so that any configuration is accepted.
      // This will be adjusted to window size after plotly is ready
      // Use infinity as value if colSize need to be calculated based on window size
      maxCols: 6,

      minRows: 1, // maximum amount of rows in the grid
      minItemRows: 2, // min item number of rows
      margin: 6, // margin between grid items
      draggable: {
        enabled: this.dragEnabled,
        dropOverItems: true,
        dragHandleClass: 'toolbar-title', // drag event only from this class. If `ignoreContent` is true.
        start: (item, itemComponent) => {  // callback when dragging an item starts.
          // adding class to set specific cursor and to prevent tooltip to show during drag
          const dragElement = itemComponent.el?.getElementsByClassName('toolbar-title')[0] as HTMLElement;
          dragElement?.classList?.add('dragging');
        },
        stop: (item, itemComponent) => { // callback when dragging an item stops.  Accepts Promise return to cancel/approve drag.
          const dragElement = itemComponent.el?.getElementsByClassName('toolbar-title')[0] as HTMLElement;
          dragElement?.classList?.remove('dragging');
        },
        ignoreContent: true // if true drag will start only from elements from `dragHandleClass`
      },
      swap: false, // allow items to switch position if drop on top of another
      disableScrollHorizontal: true,
      disableScrollVertical: true,
      pushItems: true, // push items when resizing and dragging
      resizable: {
        enabled: true, // enable/disable resizable items
      }
    };

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
    // TODO dashboard should be saved immediatly when a widget config is updated
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
      this.saveDashboard();
    }, 2000);
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
    this.showSettingWidget = false;
    this.changes++;
    this.activeAutoSave();
    // The operation is being done exclusively for the ECG because the widget uses a new functionality that allows it to
    // change size based on the configuration. Later we will have to handle it in a more general way
    const configuredWidget = this.dashboard.filter(widget => widget['id'] === this.currentWidgetIdSetting)[0];
    if (configuredWidget.type === 'ecg') {
      this.dashboard[this.dashboard.indexOf(configuredWidget)] = { ...configuredWidget };
    }
    this.pageStatus = PageStatus.Standard;
    this.widgetLayoutEvent.emit();
  }

  onWidgetFullscreenClose(data: any) {
    if (data && data?.action == 'widget:setting') {
      setTimeout(() => {
        this.openModal(data.widget)
      }, 100);
    }
  }

  onWidgetAction(data: WidgetAction) {
    switch (data.action) {
      case 'toolbar:close':
        if (!this.removingWidget) {
          const removeWidget = () => {
            this.removingWidget = true;
            this.removeItem(data.widget, () => {
              this.widgetLayoutEvent.emit();
              this.removingWidget = false;
            });
          }

          if (JSON.parse(localStorage.getItem('confirm-delete-widget-dismissed-' + this.dashboardValue.id))) {
            removeWidget();
          } else {
            const confirmDialog = this.confirmDialogService.open({
              text: $localize`:@@HYT_widget_delete_confirm:Attention, the widget and its configuration will be permanently deleted. Proceed?`,
              dismissable: $localize`:@@HYT_widget_delete_confirm_dismiss:Don't request confirmation for this dashboard anymore`,
            });
            confirmDialog.dialogRef.afterClosed().subscribe(res => {
              if (res) {
                if (res.dismissed) {
                  localStorage.setItem('confirm-delete-widget-dismissed-' + this.dashboardValue.id, JSON.stringify(true));
                }
                if (res.result === 'accept') {
                  removeWidget();
                }
              }
            });
          }
        }
        break;

      case 'toolbar:settings':
        this.currentWidgetIdSetting = data.widget.id;
        this.showSettingWidget = true;

        const widget = this.getItemById(data.widget.id);

        this.openModal(widget);
        break;

      case 'toolbar:fullscreen':
        const currentWidget = this.getItemById(data.widget.id);
        this.openFullScreenModal(currentWidget, data.value);
        break;

      case 'widget:ready':
        this.widgetReadyCounter++;
        if (this.widgetReadyCounter === this.widgets.length) {
          this.widgetLayoutEvent.emit('widgetsLayout:ready');
        }
        break;

      case 'widget:auto-save':
        this.onWidgetSettingClose(data);
        break;
    }
  }

  openModal(widget: GridsterItem) {
    const areaId = this.activatedRoute.snapshot.params.areaId;
    const hDeviceId = this.activatedRoute.snapshot.params.hDeviceId;
    const modalRef = this.dialogService.open(WidgetSettingsDialogComponent, {
      width: '800px',
      data: {
        currentWidgetIdSetting: this.currentWidgetIdSetting,
        widget,
        areaId,
        hDeviceId
      }
    });
    modalRef.dialogRef.afterClosed().subscribe(
      event => { this.onWidgetSettingClose(event) }
    );
  }

  openFullScreenModal(widget: any, initData: PacketData[] = []) {
    const modalRef = this.dialogService.open(WidgetFullscreenDialogComponent, {
      backgroundClosable: true,
      data: {
        serviceType: this.dashboardValue.dashboardType === 'REALTIME' ? ServiceType.ONLINE : ServiceType.OFFLINE,
        widget: { ...widget },
        initData,
      }
    });
    modalRef.dialogRef.afterClosed().subscribe(event => {
      this.onWidgetFullscreenClose(event);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const availableWidth = document.documentElement.clientWidth;
    const offset = 100;
    const minWidth = (this.options.fixedColWidth * this.options.maxCols) + this.options.maxCols;

    this.options.resizable.enabled = availableWidth > minWidth + offset;
    if (this.options.resizable.enabled) {
      let applyOldPosition = false;
      this.dashboard
        .sort((a, b) => a.y - b.y)
        .map((el) => {
          const position = this.originalWidgetsPosition.find(({ id }) => id === el.id);
          if (position && (el.x !== position.x || el.y !== position.y)) {
            el.x = position.x;
            el.y = position.y;

            if (!applyOldPosition) {
              applyOldPosition = true;
            }
          }
          return el;
        });

      if (applyOldPosition) {
        this.options.api.optionsChanged();
      }
    } else {
      this.dashboard
        .map((el, index, arr) => {
          el.x = 0;
          if (index > 0) {
            el.y = arr[index - 1].rows + 1;
          }
          return el;
        })
        .sort((a, b) => a.y - b.y);

      this.options.api.optionsChanged();
    }

    return
    `const colRemoved = columns < this.options.maxCols;
    // this.itemChangeEventDisabled = true;
    console.log("--------------------------")
    console.log(columns)
    console.log(cell);

    this.options.maxCols = columns;
    this.options.fixedColWidth = cell;
    this.options.fixedRowHeight = cell / 2;
    this.options.api.optionsChanged();

    // if (!colRemoved) { // come ultima cosa ho messo il col removed. Cioè se vado a stringere va bene che continuo dall'ultima ma se allargo dovrei andare a ritroso, amnca questa parte. Provare a usare una struttura ricorsiva. ELmenti aggiunti o spostati non causano problemi perché si resetta lo starting position. Ma ne vale la pena? Tanto non risolve il problema dell'evento che viene chiamato male
    //   this.dashboard.forEach((gi, i) => {
    //     gi.x = this.startingPositions[i].x;
    //     gi.y = this.startingPositions[i].y;
    //   });
    //   this.options.api.optionsChanged();
    // }

    // this.dashboard and this.gridster.grid (item.item) are the same
    const itemsToMove = this.dashboard.filter(item => (item.x + item.cols) > columns && item.x !== 0);

    // sort by size and position
    itemsToMove.sort((a, b) => {
      if (b.rows * b.cols === a.rows * a.cols) {
        return (a.y * this.options.maxCols + a.x) - (b.y * this.options.maxCols + b.x)
      }
      return (b.rows * b.cols) - (a.rows * a.cols)
    });
    console.log(itemsToMove);

    // sort by size
    //itemsToMove.sort((a, b) => (b.rows * b.cols) - (a.rows * a.cols));

    // sort by position
    // itemsToMove.sort((a, b) => (a.y * this.options.maxCols + a.x) - (b.y * this.options.maxCols + b.x));

    // temporarily removed excess items from the grid (prevent unexpected itemChangeCallback fired because of compactType: CompactType.CompactUp)
    // TODO MANCA QUESTO DA CAPIRE SE SI PUÒ USARE INVECE DI  itemChangeEventDisabled
    itemsToMove.forEach((item: any, i) => {
      itemsToMove[i].x = -Infinity;
      itemsToMove[i].y = -Infinity;
      this.options.api.optionsChanged();
    });
    itemsToMove.forEach((item: any, i) => {
      const firstPossiblePosition = this.options.api.getFirstPossiblePosition(item);
      itemsToMove[i].x = firstPossiblePosition.x;
      itemsToMove[i].y = firstPossiblePosition.y;
      this.options.api.optionsChanged();
    });
    // this.itemChangeEventDisabled = false;

    // }`
  }

  // Gridster events/methods

  onGridSizeChanged(gridster, a, b, c) {
    // TODO: ... this event seems not to be working as expected
  }

  onItemChange(item, itemComponent) {
    // if(this.itemChangeEventDisabled) {
    //   console.error("----- NOT OVERRIDE --------------")
    //   return;
    // }
    console.warn("----- CONFIGURATION OVERRIDE --------------")
    // this.startingPositions = this.dashboard.map(x => ({ x: x.x, y: x.y  }));
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
    if (item.resizeCallback) {
      item.resizeCallback(item, itemComponent);
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

  addItem(widgetTemplate: WidgetSelection) {
    for (let c = 0; c < widgetTemplate.count; c++) {
      // converting widget to dashboardWidget config
      const widget: WidgetConfig = {
        projectId: this.projectId,
        name: widgetTemplate.name,
        type: widgetTemplate.type,
        x: 0,
        y: 0,
        cols: widgetTemplate.cols,
        rows: widgetTemplate.rows,
        dataUrl: '',
        dataTableUrl: '',
      };
      this.configService
        .addDashboardWidget(+this.dashboardValue.id, widget)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((w) => {
          // TODO: handle errors
          // widget saved (should have a new id)
          this.dashboard.push(widget);
        });
    }
  }

  saveDashboard() {
    // this.configService.putConfig(+this.dashboardValue.id, this.dashboard)
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((res) => {
    //     if (res && res.status_code === 200) {
    //       this.originalDashboard = [...this.dashboard];
    //     }
    //   });
  }

  getResponsiveColumns(): number {
    let columns = this.options.ma;
    const availableWidth = document.documentElement.clientWidth;
    if (availableWidth <= this.options.mobileBreakpoint) {
      columns = 1;
    } else {
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
    if (availableWidth > this.options.mobileBreakpoint) {
      singleCell = singleCell;
    } else {
      const bp = this.responsiveBreakPoints.find((p) => p.breakPoint <= availableWidth);
      if (bp) {
        singleCell = bp.cell;
      }
    }

    return singleCell;
  }

  private getTimestampFieldValue(packet: HPacket) {
    const timestampFieldName = packet.timestampField;
    return (packet.fields[timestampFieldName]) ? packet.fields[timestampFieldName].value.long : packet.fields['timestamp-default'].value.long;
  }

}
