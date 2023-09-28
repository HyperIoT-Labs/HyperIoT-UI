import { Component, OnInit, Input, OnDestroy, HostListener, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  GridsterConfig,
  GridsterItem,
  GridType,
  DisplayGrid,
  CompactType,
  GridsterComponent
} from 'angular-gridster2';

import {
  Dashboard,
  DashboardWidget,
  HPacket,
  PacketData,
  RealtimeDataService,
} from 'core';

import { DashboardConfigService } from '../dashboard-config.service';
import { WidgetSettingsDialogComponent } from '../widget-settings-dialog/widget-settings-dialog.component';
import { Subject, Observable, Subscription } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ConfirmDialogService, HytModalService, HytTopologyService } from 'components';
import {ServiceType} from '../../service/model/service-type';
import { WidgetFullscreenDialogComponent } from '../widget-fullscreen-dialog/widget-fullscreen-dialog.component';
import { WidgetAction, WidgetConfig } from '../../base/base-widget/model/widget.model';
import { WidgetSelection } from '../model/dashboard.model';

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

  private DEFAULT_TOAST_BACKGROUND_COLOUR = '#1f58a5';

  widgetReadyCounter = 0;

  @ViewChild(GridsterComponent, { static: true }) gridster: GridsterComponent;
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
  private originalDashboard: Array<GridsterItem>;
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

  private severityColors = new Map<number, string>([
    [0, '#f8b606'],
    [1, '#f87a06'],
    [2, '#bd362f'],
    [3, '#9400d3'],
  ]);

  lastWindowSize;

  eventNotificationIsOn: boolean;

  private eventPacketSuffix = '_event';
  private alarmPacketSuffix = '_event_alarm';
  private toastMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;

  /**
   * This is a demo dashboard for testing widgets
   *
   * @param dataStreamService Injected DataStreamService
   * @param configService
   * @param activatedRoute
   * @param hytModalService
   * @param hytTopologyService
   * @param toastr
   */
  constructor(
    private realtimeDataService: RealtimeDataService,
    private configService: DashboardConfigService,
    private activatedRoute: ActivatedRoute,
    private hytModalService: HytModalService,
    private hytTopologyService: HytTopologyService,
    private toastr: ToastrService,
    private confirmDialogService: ConfirmDialogService,
  ) {
    this.eventNotificationIsOn = true;
    this.configService.eventNotificationState.subscribe(res => {
      this.eventNotificationIsOn = res;
    });
  }

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
          const widgetConfFounded = this.dashboardEntity.widgets.find( x => (x.widgetConf.includes('"config"')));

          this.dashboardType = this.dashboardEntity.dashboardType;
          this.projectId = this.dashboardEntity.hproject.id;
          // connect to data upstream
          this.realtimeDataService.connect(this.projectId);
          this.streamSubscription = this.realtimeDataService.eventStream.subscribe((p) => {
            const packet = p.data;
            const remoteTimestamp: number = this.getTimestampFieldValue(packet);
            this.topologyResTimeChange.emit({timeMs: remoteTimestamp});
            if (this.eventNotificationIsOn && packet.id === 0 && (packet.name.endsWith(this.eventPacketSuffix) || packet.name.endsWith(this.alarmPacketSuffix))) {
              // show toast if packet is a event
              const event = JSON.parse(packet.fields.event.value.string).data;
              const tag = event.tags[0]; // retrieve only first tag
              let toastBackgroundColor = this.DEFAULT_TOAST_BACKGROUND_COLOUR;
              let toastImage = 'info';
              if (packet.name.endsWith(this.eventPacketSuffix)) {
                toastBackgroundColor = tag ? tag.color : this.DEFAULT_TOAST_BACKGROUND_COLOUR;
                toastImage = 'toastEvent';
              } else if (packet.name.endsWith(this.alarmPacketSuffix)) {
                if (event.alarmState === 'UP') {
                  toastBackgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_TOAST_BACKGROUND_COLOUR;
                  toastImage = 'toastAlarmUp';
                } else {
                  toastBackgroundColor = '#51a351';
                  toastImage = 'toastAlarmDown';
                }
              }
              const textColor = '#ffffff';  // TODO retrieve from tag when this property will have been added
              this.toastr.show(this.toastMessage, event.ruleName, {}, toastImage)
                .onShown.subscribe(((res) => {}), (err) => {}, () => {
                    document.querySelector('.overlay-container #toast-container .ngx-toastr')
                      .setAttribute('style', 'background-color: ' + toastBackgroundColor + '; color:' + textColor + ';');
                  });
            }
          });
          // get dashboard config
          this.getWidgetsMapped(d.widgets)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              (dashboardConfig: Array<GridsterItem>) => {
                this.dashboard = dashboardConfig;
                this.originalDashboard = JSON.parse(JSON.stringify(dashboardConfig));
                this.pageStatus = PageStatus.Standard;
              }
            );

        },
        error => {
          console.error(error);
          this.pageStatus = PageStatus.Error;
        }
      );

    // window.addEventListener('beforeunload', (e) => {
    //   this.saveDashboard();
    // });
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

    this.realtimeDataService.disconnect();
  }

  setOptions() {
    this.options = {
      gridSizeChangedCallback: this.onGridSizeChanged.bind(this),
      itemChangeCallback: this.onItemChange.bind(this),
      itemResizeCallback: this.onItemResize.bind(this),
      gridType: GridType.Fixed,
      setGridSize: true,
      compactType: CompactType.CompactUp,
      displayGrid: DisplayGrid.None,
      disableWindowResize: true,
      disableAutoPositionOnConflict: false,
      scrollToNewItems: true,
      disableWarnings: true,
      ignoreMarginInRow: false,
      mobileBreakpoint: 400,
      keepFixedHeightInMobile: true,
      keepFixedWidthInMobile: false,
      minCols: 1, maxCols: 10, maxCellsize: 280,
      minItemRows: 2,
      minRows: 1,
      margin: 6,
      draggable: {
        enabled: this.dragEnabled,
        dropOverItems: true,
        dragHandleClass: 'toolbar-title',
        start: (item, itemComponent) => {
          // adding class to set specific cursor and to prevent tooltip to show during drag
          const dragElement = itemComponent.el?.getElementsByClassName('toolbar-title')[0] as HTMLElement;
          dragElement?.classList?.add('dragging');
        },
        stop:(item, itemComponent) => {
          const dragElement = itemComponent.el?.getElementsByClassName('toolbar-title')[0] as HTMLElement;
          dragElement?.classList?.remove('dragging');
        },
        ignoreContent: true
      },
      swap: false,
      disableScrollHorizontal: true,
      disableScrollVertical: true,
      pushItems: true,
      resizable: {
        enabled: true,
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
      this.dashboard[this.dashboard.indexOf(configuredWidget)] = {...configuredWidget};
    }
    this.pageStatus = PageStatus.Standard;
    this.widgetLayoutEvent.emit();
  }

  onWidgetFullscreenClose(data: any) {

    if(data && data?.action == 'widget:setting') {
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
              dismissable: $localize`:@@HYT_widget_delete_confirm_dismiss:Do not ask for confirmation for this dashboard anymore`,
            });
            confirmDialog.afterClosed().subscribe(res => {
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
    const modalRef = this.hytModalService.open(WidgetSettingsDialogComponent, {
      currentWidgetIdSetting: this.currentWidgetIdSetting,
      widget,
      areaId
    });
    modalRef.onClosed.subscribe(
      event => { this.onWidgetSettingClose(event) }
    );
  }

  openFullScreenModal(widget: any, initData: PacketData[] = []) {
    const modalRef = this.hytModalService.open(WidgetFullscreenDialogComponent, {
      serviceType: this.dashboardValue.dashboardType === 'REALTIME' ? ServiceType.ONLINE : ServiceType.OFFLINE,
      widget: { ...widget },
      initData
    });
    modalRef.onClosed.subscribe(event => {
      this.onWidgetFullscreenClose(event);
    });
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
        this.loadDashboard();
      }, 500);

    }
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

  private getTimestampFieldValue(packet: HPacket){
    const timestampFieldName = packet.timestampField;
    return (packet.fields[timestampFieldName]) ? packet.fields[timestampFieldName].value.long : packet.fields['timestamp-default'].value.long;
  }

}
