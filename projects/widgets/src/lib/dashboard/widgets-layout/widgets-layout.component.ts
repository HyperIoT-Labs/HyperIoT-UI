import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GridStackNode, GridStackOptions, GridStackWidget } from 'gridstack';
import { elementCB, GridstackComponent } from 'gridstack/dist/angular';

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

  @ViewChild(WidgetSettingsDialogComponent, { static: true }) widgetSetting: WidgetSettingsDialogComponent;

  @ViewChild(GridstackComponent, { static: false }) gridstackComponent: GridstackComponent;

  @Input() dashboardValue: Dashboard;

  @Input() widgets: string | any[];

  @Output() widgetLayoutEvent = new EventEmitter<any>();

  @Output() topologyResTimeChange = new EventEmitter<any>();

  dashboard: WidgetConfig[] = [];
  dashboardType: Dashboard.DashboardTypeEnum;
  serviceType = ServiceType;
  pageStatus: PageStatus = PageStatus.Loading;
  /** Draws the grid cells behind the widgets */
  showGrid = false;

  private dashboardEntity: Dashboard;

  private projectId: number;
  private currentWidgetIdSetting: number;
  private removingWidget = false;

  /** Last configuration sent to the server, used to skip saves when nothing changed */
  private lastSavedSnapshot: string;

  /**
   * Gridstack options of each widget, by widget id.
   * The same object must be returned on every change detection, otherwise gridstack re-applies it.
   */
  private gridNodes = new Map<number, GridStackWidget>();

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe = new Subject<void>();
  private streamSubscription: Subscription;

  private readonly MAX_COLS = 10;
  private readonly MIN_ITEM_ROWS = 2;
  // gap between widgets is twice the margin
  private readonly ITEM_MARGIN = 3;
  // row height plus the gap between rows
  private readonly CELL_HEIGHT = 86;
  /**
   * How widgets are placed when the grid has fewer columns than the saved layout:
   * 'list' keeps the reading order (may leave gaps), 'compact' puts each widget in the first free slot
   */
  private readonly SHRINK_LAYOUT: 'list' | 'compact' = 'list';

  readonly gridOptions: GridStackOptions = {
    column: this.MAX_COLS,
    cellHeight: this.CELL_HEIGHT,
    margin: this.ITEM_MARGIN,
    minRow: 1,
    mode: 'top', // widgets move up to fill empty space
    handle: '.toolbar-title',
    resizable: { handles: 'e,se,s,sw,w' },
    columnOpts: {
      columnMax: this.MAX_COLS,
      // with a function gridstack restores its cached positions when the grid gets wider,
      // and calls it only for the widgets it has to place
      layout: (column, oldColumn, placed, toPlace) => this.reflowWidgets(column, placed, toPlace),
      // grid width -> columns, keeps every column at least ~140px wide
      breakpoints: [
        { w: 1400, c: 8 },
        { w: 1120, c: 6 },
        { w: 840, c: 4 },
        { w: 560, c: 3 },
        { w: 420, c: 2 },
        { w: 280, c: 1 },
      ],
    },
  };

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
  }

  private loadDashboard(): void {
    this.dashboard = [];
    this.gridNodes.clear();

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
                this.lastSavedSnapshot = this.getDashboardSnapshot();

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

  // Grid events

  trackByWidgetId(index: number, widget: WidgetConfig): number {
    return widget.id;
  }

  getGridNode(widget: WidgetConfig): GridStackWidget {
    let node = this.gridNodes.get(widget.id);
    if (!node) {
      node = this.createGridNode(widget);
      this.gridNodes.set(widget.id, node);
    }
    return node;
  }

  private createGridNode(widget: WidgetConfig, autoPosition = false): GridStackWidget {
    return {
      id: String(widget.id),
      x: widget.x,
      y: widget.y,
      w: widget.cols,
      h: widget.rows,
      minH: this.MIN_ITEM_ROWS,
      autoPosition,
    };
  }

  /**
   * Called once per grid operation (drag, resize, add, remove).
   * Column changes (window resize) don't emit any event: they only re-arrange the view.
   * Copies the layout from gridstack into the widgets and saves it if it changed.
   */
  onGridChange(): void {
    const grid = this.gridstackComponent?.grid;
    if (!grid) {
      return;
    }

    // save() returns the full width layout even when the grid is showing fewer columns,
    // so a small screen never alters the saved layout
    const layout = grid.save(false) as GridStackWidget[];
    layout.forEach(({ id, x, y, w, h }) => {
      const widget = this.dashboard.find((item) => String(item.id) === id);
      if (widget) {
        widget.x = x;
        widget.y = y;
        // save() omits default sizes: w when 1 column, h when at the minimum rows
        widget.cols = w ?? 1;
        widget.rows = h ?? this.MIN_ITEM_ROWS;
      }
    });

    this.saveDashboard();
  }

  /**
   * Places the widgets when the grid has fewer columns than the saved layout.
   * Widgets keep their size (shrunk only if wider than the grid) and follow the order of the saved layout,
   * so the result depends only on the saved layout and on the number of columns.
   *
   * @param column new number of columns
   * @param placed widgets already positioned by gridstack from its cache, the placed widgets are added here
   * @param toPlace widgets to position
   */
  private reflowWidgets(column: number, placed: GridStackNode[], toPlace: GridStackNode[]): void {
    // the saved layout fits in the grid: use it as it is.
    // Needed when widening: gridstack caches the loaded layout by its own width (e.g. 8 columns),
    // so going back to 10 columns finds no cache and calls this function
    const savedWidth = Math.max(0, ...this.dashboard.map(({ x, cols }) => (x ?? 0) + (cols ?? 1)));
    if (column >= savedWidth) {
      toPlace.forEach((node) => {
        const widget = this.dashboard.find(({ id }) => String(id) === node.id);
        if (widget) {
          node.x = widget.x;
          node.y = widget.y;
          node.w = widget.cols;
        }
        placed.push(node);
      });
      return;
    }

    const occupied = new Set<string>();
    const occupy = ({ x, y, w, h }: GridStackNode) => {
      for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
          occupied.add(`${col},${row}`);
        }
      }
    };
    const isFree = (x: number, y: number, w: number, h: number) => {
      for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
          if (occupied.has(`${col},${row}`)) {
            return false;
          }
        }
      }
      return true;
    };
    placed.forEach(occupy);

    const items = toPlace
      .map((node) => ({ node, widget: this.dashboard.find(({ id }) => String(id) === node.id) }))
      .sort((a, b) => {
        const ay = a.widget?.y ?? a.node.y ?? 0;
        const by = b.widget?.y ?? b.node.y ?? 0;
        return ay !== by ? ay - by : (a.widget?.x ?? a.node.x ?? 0) - (b.widget?.x ?? b.node.x ?? 0);
      });

    // cells are scanned in reading order: index = y * column + x
    let nextIndex = 0;
    items.forEach(({ node, widget }) => {
      const w = Math.min(widget?.cols ?? node.w, column);
      const h = node.h;
      let index = this.SHRINK_LAYOUT === 'list' ? nextIndex : 0;
      while (index % column + w > column || !isFree(index % column, Math.floor(index / column), w, h)) {
        index++;
      }

      node.x = index % column;
      node.y = Math.floor(index / column);
      node.w = w;
      occupy(node);
      placed.push(node);
      nextIndex = index + w;
    });
  }

  onDragStart({ el }: elementCB): void {
    // adding class to set specific cursor and to prevent tooltip to show during drag
    el.querySelector('.toolbar-title')?.classList.add('dragging');
  }

  onDragStop({ el }: elementCB): void {
    el.querySelector('.toolbar-title')?.classList.remove('dragging');
  }

  /** Applies to the grid a size set by the widget configuration (e.g. ECG, defibrillator) */
  private updateGridItemSize(widget: WidgetConfig): void {
    const grid = this.gridstackComponent?.grid;
    const node = grid?.engine.nodes.find(({ id }) => id === String(widget.id));
    if (node) {
      grid.update(node.el, { w: widget.cols, h: widget.rows });
    }
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
    const { cols, rows } = widget;
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
          // some settings (e.g. ECG, defibrillator) change the widget size
          if (widget.cols !== cols || widget.rows !== rows) {
            this.updateGridItemSize(widget);
          }
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

  private removeItem(widget: WidgetConfig, callback: any): void {
    if (widget.id > 0) {
      this.configService
        .removeDashboardWidget(widget.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            // the grid removes the item and emits 'removed', which saves the new layout
            this.dashboard.splice(this.dashboard.indexOf(widget), 1);
            this.gridNodes.delete(widget.id);

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
            // the grid places the item in the first free slot and emits 'added', which saves the new layout
            const node = this.createGridNode(newWidget, true);
            // a widget wider than the visible columns would make gridstack drop its full width layout
            // and save the reduced one, so on a narrow grid it starts as wide as the grid
            node.w = Math.min(node.w, this.gridstackComponent?.grid?.getColumn() ?? this.MAX_COLS);
            this.gridNodes.set(newWidget.id, node);
            this.dashboard.push(newWidget);
          },
          error: (err) => {
            console.error(err);
          }
        });
    }
  }

  private getDashboardSnapshot(): string {
    return JSON.stringify(
      this.dashboard.map(({ id, x, y, cols, rows, name, config }) => ({ id, x, y, cols, rows, name, config }))
    );
  }

  saveDashboard(): void {
    const snapshot = this.getDashboardSnapshot();
    if (snapshot === this.lastSavedSnapshot) {
      return;
    }
    this.lastSavedSnapshot = snapshot;

    this.configService.putConfig(this.dashboardValue.id, this.dashboard)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((res: any) => {
        if (res && res.status_code === 200) {
          console.log('Dashboard updated');
        }
      });
  }

  private getTimestampFieldValue(packet: HPacket): number {
    const timestampFieldName = packet.timestampField;
    return packet.fields[timestampFieldName]
      ? packet.fields[timestampFieldName].value.long
      : packet.fields['timestamp-default'].value.long;
  }

}
