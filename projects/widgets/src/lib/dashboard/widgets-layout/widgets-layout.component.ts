import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  CompactType,
  DisplayGrid,
  GridType,
  GridsterComponent,
  GridsterConfig,
  GridsterItemComponentInterface
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

type WidgetPosition = Pick<WidgetConfig, 'id' | 'x' | 'y' | 'rows' | 'cols'>;

@Component({
  selector: 'hyperiot-dashboard-widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class WidgetsDashboardLayoutComponent implements OnInit, OnDestroy {
  widgetReadyCounter = 0;

  @ViewChild(WidgetSettingsDialogComponent, { static: true }) widgetSetting: WidgetSettingsDialogComponent;

  @ViewChild(GridsterComponent, { static: false }) gridsterComponent: GridsterComponent;

  @Input() options: GridsterConfig;
  @Input() dashboardValue: Dashboard;

  @Input() widgets: string | any[];

  @Output() widgetLayoutEvent = new EventEmitter<any>();

  @Output() topologyResTimeChange = new EventEmitter<any>();

  private isResizeWindow = false;
  private skip = false;

  dashboard: WidgetConfig[] = [];
  lastDashboardValue: WidgetConfig[] = [];
  dashboardType: Dashboard.DashboardTypeEnum;
  serviceType = ServiceType;
  pageStatus: PageStatus = PageStatus.Loading;

  private dashboardEntity: Dashboard;
  private dragEnabled = true;
  private originalWidgetsPosition: WidgetPosition[] = [];

  private projectId: number;
  private currentWidgetIdSetting: number;
  private removingWidget = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe = new Subject<void>();
  private streamSubscription: Subscription;

  private readonly DEFAULT_MAX_COLS = 10;
  private readonly DEFAULT_MARGIN_ITEMS = 6;
  private readonly DEFAULT_CELL_SIZE = 160;

  private readonly responsiveBreakPoints: { breakPoint: number, columns: number }[] = [
    { breakPoint: 1700, columns: this.DEFAULT_MAX_COLS },
    { breakPoint: 1610, columns: 8 },
    { breakPoint: 1281, columns: 7 },
    { breakPoint: 1024, columns: 4 },
    { breakPoint: 640, columns: 4 },
    { breakPoint: 480, columns: 3 },
    { breakPoint: 400, columns: 2 },
    { breakPoint: 0, columns: 1 }
  ];

  private oldBreakPoint: number;

  private resizeSubscription: Subscription;

  /**
   * This is a demo dashboard for testing widgets
   *
   * @param dataStreamService Injected DataStreamService
   * @param configService
   * @param activatedRoute
   * @param dialogService
   */
  constructor(
    private realtimeDataService: RealtimeDataService,
    private configService: DashboardConfigService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }

    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }

    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }

    this.saveDashboard();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.handleResize();
  }

  private handleResize() {
    this.isResizeWindow = true;

    const { columns, breakPoint } = this.getResponsiveBreakPoint();
    if (this.oldBreakPoint !== breakPoint) {
      this.oldBreakPoint = breakPoint;

      const isMaxList = this.dashboard.some(({ cols, x }) => x + cols > columns);
      if (isMaxList) {
        this.dashboard.forEach((widget, index, array) => {
          if (columns < 6) {
            widget.x = 0;
            widget.cols = columns;
          } else {
            widget.x = widget.x - 1 < 0 ? 0 : widget.x - 1;
            if (index > 0) {
              const previous = array[index - 1];
              widget.y = previous.y + previous.rows + 1;
            }
          }
        });

        this.sortDashboardWidget();
      } else {
        const isMaxOriginalWidgetsPositionList = this.originalWidgetsPosition.some(({ cols, x }) => x + cols > columns);
        if (isMaxOriginalWidgetsPositionList) {
          return
        }

        let sortWidgets = false;

        this.dashboard.forEach((widget) => {
          const position = this.originalWidgetsPosition.find(({ id }) => id === widget.id);

          if (position) {
            const { x, y, cols, rows } = position;
            if (
              widget.x !== x
              || widget.y !== y
              || widget.cols !== cols
              || widget.rows !== rows
            ) {
              widget.x = x;
              widget.y = y;
              widget.cols = cols;
              widget.rows = rows;

              if (!sortWidgets) {
                sortWidgets = true;
              }
            }
          }
        });

        if (sortWidgets) {
          this.sortDashboardWidget();
        }
      }
    }

    this.options.maxCols = columns;
    this.options.api.optionsChanged();

    this.isResizeWindow = false;
  }

  private handleResizeX() {
    this.isResizeWindow = true;

    const { columns, breakPoint } = this.getResponsiveBreakPoint();

    this.options.maxCols = columns;
    // this.options.api.optionsChanged();

    // console.log(
    //   x
    // );

    // this.gridsterComponent.options.maxCols = columns;

    // this.gridsterComponent.$options.maxCols = columns;
    // this.gridsterComponent.setOptions()
    // let widgetsIndex = this.gridsterComponent.grid.length - 1;

    // this.skip = true
    // for (; widgetsIndex >= 0; widgetsIndex--) {
    //   const widget = this.gridsterComponent.grid[widgetsIndex];
    //   console.log('skip', this.skip);

    //   // widget.updateOptions();
    // }
    // this.skip = false


    const availableWidth = document.documentElement.clientWidth;

    // const minWidth = (this.options.maxCols * this.options.fixedColWidth) + (this.options.maxCols * this.options.margin) + this.options.margin;
    // const minWidth = (columns * this.options.fixedColWidth) + (columns * this.options.margin) + this.options.margin;
    const minWidth = (this.gridsterComponent.columns * this.options.fixedColWidth) + (this.gridsterComponent.columns * this.options.margin) + this.options.margin;
    // const minWidth = this.gridsterComponent.curWidth;

    // const minWidth = x.curWidth;
    const offset = this.options.margin;
    const checkAvailableSpace = availableWidth > minWidth + offset;
    console.log('availableWidth', availableWidth);
    // console.log('minWidth', minWidth);
    console.log('tot', minWidth + offset);
    console.log('curWidth', this.gridsterComponent.curWidth);
    console.log('checkAvailableSpace', checkAvailableSpace);

    if (checkAvailableSpace) {

      let applyOldPosition = false;
      this.dashboard.map((widget) => {
        const position = this.originalWidgetsPosition.find(({ id }) => id === widget.id);

        if (position) {
          const { x, y, cols, rows } = position;
          if (
            widget.x !== x
            || widget.y !== y
            || widget.cols !== cols
            || widget.rows !== rows
          ) {
            widget.x = x;
            widget.y = y;
            widget.cols = cols;
            widget.rows = rows;

            if (!applyOldPosition) {
              applyOldPosition = true;
            }
          }
        }

        return widget;
      });

      if (applyOldPosition) {
        this.sortDashboardWidget();
      }
    } else {
      this.dashboard.map((widget, index, arr) => {
        widget.x = 0;

        if (index > 0) {
          const previous = arr[index - 1];
          widget.y = previous.y + previous.rows + 1;
        }

        // widget.cols = this.options.maxCols || 1;
        // widget.cols = this.gridsterComponent.columns || 1;
        widget.cols = columns || 1;
        console.log('cols', widget.cols);

        return widget;
      });

      this.sortDashboardWidget();
    }

    // this.gridsterComponent.optionsChanged()

    this.isResizeWindow = false;

    // this.gridsterComponent.optionsChanged()
    this.options.api.optionsChanged();
  }

  private getResponsiveBreakPoint() {
    const availableWidth = document.documentElement.clientWidth;
    const responsiveBreakPoint = this.responsiveBreakPoints.find(({ breakPoint }) => breakPoint <= availableWidth);
    // console.log(responsiveBreakPoint.breakPoint, responsiveBreakPoint.columns);

    return responsiveBreakPoint;
  }

  private loadDashboard(): void {
    this.setOptions();

    this.dashboard = [];

    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = null;
    }

    this.configService.getDashboard(this.dashboardValue.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (d: Dashboard) => {
          this.dashboardEntity = d;

          this.dashboardType = this.dashboardEntity.dashboardType;
          this.projectId = this.dashboardEntity.hproject.id;
          this.streamSubscription = this.realtimeDataService.eventStream
            .subscribe((p) => {
              const packet = p.data;
              const remoteTimestamp = this.getTimestampFieldValue(packet);
              this.topologyResTimeChange.emit({ timeMs: remoteTimestamp });
            });

          // get dashboard config
          this.getWidgetsMapped(d.widgets)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (dashboardConfig: any[]) => {
                this.dashboard = [...dashboardConfig];

                this.sortDashboardWidget();
                this.updateOriginalWidgetsPosition();
                // this.onWindowResize();

                this.pageStatus = PageStatus.Standard;
              }
            });
        },
        error: (err) => {
          console.error(err);
          this.pageStatus = PageStatus.Error;
        }
      });
  }

  private sortDashboardWidget() {
    this.dashboard.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
    this.dashboard.forEach((widget, index, array) => {
      if (index > 0) {
        const previous = array[index - 1];
        widget.y = previous.y + previous.rows + 1;
      }
    });
  }

  private updateOriginalWidgetsPosition = () => {
    this.originalWidgetsPosition = this.dashboard.map(({ id, x, y, cols, rows }) => ({ id, x, y, cols, rows }));
    console.log('call updateOriginalWidgetsPosition');
  }

  private setOptions(): void {
    this.options = { // callback to call for each item when is changes x, y, rows, cols.
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
      maxCols: this.DEFAULT_MAX_COLS, // maximum amount of columns in the grid
      minRows: 1, // maximum amount of rows in the grid
      minItemRows: 2, // min item number of rows
      margin: this.DEFAULT_MARGIN_ITEMS, // margin between grid items
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

          setTimeout(() => {
            this.updateOriginalWidgetsPosition();
          }, 500);
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

    this.options.fixedColWidth = this.DEFAULT_CELL_SIZE;
    this.options.fixedRowHeight = this.DEFAULT_CELL_SIZE / 2;
  }

  private getWidgetsMapped(widgets: any): Observable<any> {
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
      (error: any) => console.error(error)
    ));
  }

  // Widget events
  onWidgetSettingClose(event: any) {
    // The operation is being done exclusively for the ECG because the widget uses a new functionality that allows it to
    // change size based on the configuration. Later we will have to handle it in a more general way
    const configuredWidget = this.dashboard.find(widget => widget.id === this.currentWidgetIdSetting);
    if (configuredWidget?.type === 'ecg') {
      this.dashboard[this.dashboard.indexOf(configuredWidget)] = { ...configuredWidget };
    }
    this.saveDashboard();

    this.pageStatus = PageStatus.Standard;
    this.widgetLayoutEvent.emit();
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

              this.saveDashboard();
            });
          }

          if (JSON.parse(localStorage.getItem('confirm-delete-widget-dismissed-' + this.dashboardValue.id))) {
            removeWidget();
          } else {
            const confirmDialog = this.confirmDialogService.open({
              text: $localize`:@@HYT_widget_delete_confirm:Attention, the widget and its configuration will be permanently deleted. Proceed?`,
              dismissable: $localize`:@@HYT_widget_delete_confirm_dismiss:Don't request confirmation for this dashboard anymore`,
            });
            confirmDialog.dialogRef
              .afterClosed()
              .subscribe(res => {
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
        this.openModal(data.widget);
        break;

      case 'toolbar:fullscreen':
        this.currentWidgetIdSetting = data.widget.id;
        this.openFullScreenModal(data.widget, data.value);
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

  private openModal(widget: WidgetConfig) {
    const { areaId, hDeviceId } = this.activatedRoute.snapshot.params;
    const modalRef = this.dialogService.open(WidgetSettingsDialogComponent, {
      width: '800px',
      data: {
        currentWidgetIdSetting: this.currentWidgetIdSetting,
        widget,
        areaId,
        hDeviceId
      }
    });

    modalRef.dialogRef
      .afterClosed()
      .subscribe({
        next: (event) => {
          this.onWidgetSettingClose(event);
        }
      });
  }

  private openFullScreenModal(widget: any, initData: PacketData[] = []) {
    const modalRef = this.dialogService.open(WidgetFullscreenDialogComponent, {
      backgroundClosable: true,
      data: {
        serviceType: this.dashboardValue.dashboardType === 'REALTIME' ? ServiceType.ONLINE : ServiceType.OFFLINE,
        widget: { ...widget },
        initData,
      }
    });

    modalRef.dialogRef.afterClosed()
      .subscribe(data => {
        if (data && data?.action == 'widget:setting') {
          setTimeout(() => {
            this.openModal(data.widget);
          }, 100);
        }
      });
  }

  onItemChange(item: WidgetConfig, itemComponent: GridsterItemComponentInterface): void {
    if (typeof item.change === 'function') {
      item.change();
    }

    // this.updateOriginalWidgetsPosition();

    this.saveDashboard();
  }

  onItemResize(item: WidgetConfig, itemComponent: GridsterItemComponentInterface): void {
    if (!this.skip && !this.isResizeWindow) {
      const widget = this.dashboard.find(({ id }) => id === item.id);
      if (widget) {
        const { x, y, cols, rows } = itemComponent.$item;
        widget.x = x;
        widget.y = y;
        widget.cols = cols;
        widget.rows = rows;

        this.sortDashboardWidget();
        this.updateOriginalWidgetsPosition();

        // this.options.api.optionsChanged();
      }
    }
  }

  private removeItem(widget: WidgetConfig, callback: any): void {
    if (widget.id > 0) {
      this.configService
        .removeDashboardWidget(widget.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.dashboard.splice(this.dashboard.indexOf(widget), 1);

            this.sortDashboardWidget();
            this.updateOriginalWidgetsPosition();

            if (callback) {
              callback();
            }
          },
          error: (err) => {
            console.error(err);
          }
        });
    } else if (callback) {
      callback();
    }
  }

  addItem(widgetTemplate: WidgetSelection): void {
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
        dataTableUrl: ''
      };

      this.configService
        .addDashboardWidget(this.dashboardValue.id, widget)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (newWidget: WidgetConfig) => {
            this.dashboard.push(newWidget);

            this.sortDashboardWidget();
            this.updateOriginalWidgetsPosition();

            this.saveDashboard();
          },
          error: (err) => {
            console.error(err);
          }
        });
    }
  }

  private saveDashboard(): void {
    let updateConfig = true;

    if (this.lastDashboardValue.length) {
      updateConfig = false;
      for (let index = 0; index < this.dashboard.length; index++) {
        const element = this.dashboard[index];
        const element2 = this.lastDashboardValue[index];

        if (element.x !== element2.x
          || element.y !== element2.y
          || element.cols !== element2.cols
          || element.rows !== element2.rows
        ) {
          updateConfig = true;
          break;
        }
      }
    }

    if (updateConfig) {
      this.lastDashboardValue = [...this.dashboard];
      this.configService.putConfig(this.dashboardValue.id, this.dashboard)
        .pipe(
          takeUntil(this.ngUnsubscribe),
        )
        .subscribe((res: any) => {
          if (res && res.status_code === 200) {
            console.log('New widget added');
          }
        });
    }
  }

  private getTimestampFieldValue(packet: HPacket): number {
    const timestampFieldName = packet.timestampField;
    return packet.fields[timestampFieldName]
      ? packet.fields[timestampFieldName].value.long
      : packet.fields['timestamp-default'].value.long;
  }

}
