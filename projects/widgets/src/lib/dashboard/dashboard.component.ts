import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'components';
import {
  AlgorithmOfflineDataService,
  Area,
  AreasService,
  Dashboard, HDevice,
  HdevicesService,
  HProject,
  Logger,
  LoggerService,
  OfflineDataService
} from 'core';
import { debounceTime, Subject, Subscription, takeUntil } from 'rxjs';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { DashboardPreset, DashboardPresetModel } from './model/dashboard.model';
import { DashboardEventService } from './services/dashboard-event.service';
import { DashboardEvent } from './services/dashboard-event.model';

enum PageStatus {
  Loading = 0,
  Standard = 1,
  New = 2,
  Error = -1
}

enum TopologyStatus {
  Off = -1,
  Loading = 0,
  Activated = 1,
  On = 2
}

interface HytSelectOption extends HProject {
  label: string;
  value?: number;
  entityModifyDate?: any;
}

@Component({
  selector: 'hyperiot-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DashboardViewComponent)
  dashboardView: DashboardViewComponent;

  widgetLayoutReady = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  dashboardList: Dashboard[] = [];

  hProjectList: HProject[] = [];

  hProjectListOptions: HytSelectOption[] = [];

  PageStatus = PageStatus;

  pageStatus: PageStatus = PageStatus.Loading;

  @Input() signalIsOn = true;

  streamIsOn = true;

  dataRecordingIsOn = false;

  eventNotificationIsOn = true;

  dataRecordingStatus = TopologyStatus.Off;

  idProjectSelected: number | undefined = undefined;

  currentDashboardId: number;

  currentDashboard: Dashboard;

  currentDashboardType: Dashboard.DashboardTypeEnum;

  recordStateInLoading = true;

  updateRecordingInterval;

  upTimeSec;

  packetsInDashboard: number[] = [];

  areaId: number | undefined = undefined;
  hDeviceId: number | undefined = undefined;
  areaPath: Area[];
  showAreas = false;
  areaListOptions = [] as any[];
  selectedAreaId: number;

  showHDevice = false;
  hDeviceListOptions = [] as any[];
  selectedHDeviceId: number;
  currentDevice: HDevice;
  currentDeviceTooltip: string;

  @Input() debug = false;

  subProjectList: Subscription;
  subTopologyStatus: Subscription;

  /**
   * It checks when offline data have been loaded
   */
  offlineWidgetStatus: PageStatus;

  @Input() enableAddWidget: boolean | undefined = undefined;
  @Input() enableProjectSelection: boolean | undefined = undefined;
  @Input() enableProjectEdit: boolean | undefined = undefined;
  @Input() enableTopologyToolbar: boolean | undefined = undefined;
  @Input() enableStreamControl: boolean | undefined = undefined;
  @Input() enableOnlineOffline: boolean | undefined = undefined;
  @Input() enableBreadcrumb: boolean | undefined = undefined;
  @Input() presetPermission: DashboardPreset = 'full';

  dashboardPreset: DashboardPresetModel = {
    readonly: {
      enableAddWidget: false,
      enableProjectSelection: false,
      enableProjectEdit: false,
      enableTopologyToolbar: false,
      enableStreamControl: false,
      enableOnlineOffline: false,
      enableBreadcrumb: false
    },
    minimal: {
      enableAddWidget: false,
      enableProjectSelection: false,
      enableProjectEdit: false,
      enableTopologyToolbar: true,
      enableStreamControl: true,
      enableOnlineOffline: true,
      enableBreadcrumb: false
    },
    full: {
      enableAddWidget: true,
      enableProjectSelection: true,
      enableProjectEdit: true,
      enableTopologyToolbar: true,
      enableStreamControl: true,
      enableOnlineOffline: true,
      enableBreadcrumb: false
    }
  };

  private logger: Logger;

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private offlineDataService: OfflineDataService,
    private algorithmOfflineDataService: AlgorithmOfflineDataService,
    private areaService: AreasService,
    private hDeviceService: HdevicesService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private loggerService: LoggerService,
    private dashboardEvent: DashboardEventService
  ) {
    this.offlineWidgetStatus = PageStatus.Standard;
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(DashboardComponent.name);
  }

  ngOnInit() {

    this.showAreas = this.activatedRoute.snapshot.routeConfig.path.startsWith('areas/');
    this.showHDevice = this.activatedRoute.snapshot.routeConfig.path.startsWith('hdevice/');

    if (!this.showAreas) {
      if (this.activatedRoute.snapshot.queryParams.projectId) {
        this.idProjectSelected = +this.activatedRoute.snapshot.queryParams.projectId;
      } else if (localStorage.getItem('last-dashboard-project')) {
        this.idProjectSelected = +localStorage.getItem('last-dashboard-project');
      }
    }

    this.offlineDataService.countEventSubject.subscribe(res => {
      this.offlineWidgetStatus = res;
    });

    if (this.showAreas) {
      this.idProjectSelected = +this.activatedRoute.snapshot.params.projectId;
      // load area realtime Dashboard
      if (!this.areaId) {
        this.areaId = +this.activatedRoute.snapshot.params.areaId;
      }
      if (this.areaId) {
        this.areaService.getAreaPath(this.areaId).subscribe((areas: Area[]) => {
          this.areaPath = areas;
          this.showDashboard();
        });
      }
    } else if (this.showHDevice) {
      this.idProjectSelected = +this.activatedRoute.snapshot.params.projectId;
      // load area realtime Dashboard
      if (!this.hDeviceId) {
        this.hDeviceId = +this.activatedRoute.snapshot.params.hDeviceId;
      }
      if (this.hDeviceId) {
        this.hDeviceService.findHDevice(this.hDeviceId).subscribe((hDevice: HDevice) => {
          if (hDevice) {
            this.currentDevice = hDevice;
            // TODO: terminate tooltip
/*            this.currentDeviceTooltip = `
            Brand: ${hDevice.brand}
            Model: ${hDevice.model}
            Firmware ver.: ${hDevice.firmwareVersion}
            SW ver.: ${hDevice.softwareVersion}
            Device id: ${hDevice.id}
          `;*/
          }
          this.showDashboard();
        });
      }
    } else {
      this.getProjectList();
    }
    this.applyPreset();

  }

  ngAfterViewInit(): void {
    if(localStorage.getItem('offline')) this.changeSignalState(null)
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    if (this.updateRecordingInterval) {
      clearInterval(this.updateRecordingInterval);
    }

    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  applyPreset() {
    const preset = this.dashboardPreset[this.presetPermission];
    if (preset) {
      Object.keys(preset).map((el: string) => {
        if (this[el] === undefined) {
          this[el] = preset[el];
        }
      });
    }
  }

  /**
   * Fn called when the user selects a new dashboard from the list
   * @param event
   */
  onSelectChange(event) {
    this.packetsInDashboard = [];
    this.pageStatus = PageStatus.Loading;
    this.idProjectSelected = event.value;
    clearInterval(this.updateRecordingInterval);
    this.recordStateInLoading = true;
    this.signalIsOn = true;
    this.updateToplogyStatus();
    this.updateRecordingInterval = setInterval(() => {
      this.updateToplogyStatus();
    }, 60000);
    if (this.showAreas) {
      // TODO: select change still not implemented for Areas Dashboard
    } else {
      this.getRealTimeDashboard();
    }
  }

  /**
   * Fn called when the user switches between online/offline dashboards
   * @param event
   */
  changeSignalState(event) {
    if (this.signalIsOn) {
      this.signalIsOn = !this.signalIsOn;
      this.pageStatus = PageStatus.Loading;
      this.getOfflineDashboard();
    } else {
      this.signalIsOn = !this.signalIsOn;
      this.pageStatus = PageStatus.Loading;
      if (this.showAreas) {
        this.getRealTimeDashboard();
      } else {
        this.getRealTimeDashboard();
      }
    }
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
    this.dashboardEvent.commandEvent.next(this.streamIsOn ? DashboardEvent.Command.PLAY : DashboardEvent.Command.PAUSE);
    this.dashboardView.dashboardLayout.dashboard.forEach(widget => {
      if (widget?.instance?.toolbar?.config?.showPlay) {
        // handle only with widgets which have play/pause button on their toolbar
        widget.instance.toolbar.play(this.streamIsOn);
      }
    });
  }

  changeTopologyState(event) {
    this.dataRecordingIsOn = event.dataRecordingIsOn;
    this.dashboardEvent.commandEvent.next(this.dataRecordingIsOn ? DashboardEvent.Command.RUN : DashboardEvent.Command.STOP);
    this.dataRecordingStatus = (event.dataRecordingIsOn) ? TopologyStatus.Activated : TopologyStatus.Off;
    this.upTimeSec = event.upTimeSec;
  }

  updateToplogyStatus() {
    this.subTopologyStatus = this.dashboardConfigService.getRecordingStatus(this.idProjectSelected)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
          if (res !== null && res !== undefined && res.status.toLowerCase() === 'active') {
            this.dataRecordingIsOn = true;
            this.dataRecordingStatus = (this.dataRecordingStatus === 2) ? TopologyStatus.On : TopologyStatus.Activated;
            if (res.uptimeSecs) {
              let seconds = res.upTimeSec;
              const days = Math.floor(seconds / (3600 * 24));
              seconds -= days * 3600 * 24;
              const hrs = Math.floor(seconds / 3600);
              seconds -= hrs * 3600;
              const mnts = Math.floor(seconds / 60);
              seconds -= mnts * 60;
              this.upTimeSec = days + 'd, ' + hrs + 'h, ' + mnts + 'm';
            } else {
              this.upTimeSec = undefined;
            }
          } else {
            this.dataRecordingIsOn = false;
            this.dataRecordingStatus = TopologyStatus.Off;
            this.upTimeSec = undefined;
          }
          this.recordStateInLoading = false;
        },
        error => {
          this.dataRecordingIsOn = false;
          this.dataRecordingStatus = TopologyStatus.Off;
          this.recordStateInLoading = false;
          this.upTimeSec = undefined;
          this.logger.error(error);
        }
      );
  }

  /**
   * Method that save the current Dashboard
   */
  saveDashboard() {
    this.dashboardView.saveDashboard();
  }

  openWidgetModal() {
    const widgetModalRef = this.dialogService.open(
      AddWidgetDialogComponent,
      {
        data: { signalIsOn: this.signalIsOn },
        backgroundClosable: true,
        height: '600px',
        width: '1024px',
      }
    );
    widgetModalRef.dialogRef.afterClosed().subscribe(res => {
      this.dashboardView?.onWidgetsAdd(res);
    });
  }

  timeLineSelection(event: Date[]) {
    if (event[0] && event[1]) {
      this.offlineDataService.getEventCount(event[0].getTime(), event[1].getTime());
    } else {
      this.offlineDataService.getEventCountEmpty();
    }
  }

  goToEditProject() {
    this.router.navigateByUrl(`/projects/${this.idProjectSelected}`);
  }

  private getProjectList() {
    this.subProjectList = this.dashboardConfigService.getProjectsList()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          try {
            this.hProjectList = [...res];
            this.hProjectListOptions = this.hProjectList as HytSelectOption[];
            this.hProjectListOptions.forEach(element => {
              element.label = element.name;
              element.value = element.id;
            });

            this.hProjectListOptions.sort((a: HytSelectOption  , b) => {
              if (a.entityModifyDate > b.entityModifyDate) { return -1; }
              if (a.entityModifyDate < b.entityModifyDate) { return 1; }
              return 0;
            });

            if (this.hProjectListOptions.length > 0) {
              if (!this.idProjectSelected || !this.hProjectList.some(hProject => hProject.id === this.idProjectSelected)) {
                this.idProjectSelected = this.hProjectListOptions[0].id;
              }
              this.showDashboard();
            } else {
              this.pageStatus = PageStatus.New;
            }

          } catch (error) {
            this.logger.error(error);
            this.pageStatus = PageStatus.Error;
          }

        },
        error => {
          this.pageStatus = PageStatus.Error;
        }

      );
  }

  private showDashboard() {
    console.log('DeviceId/AreaId/ProjectId/SignalIsOn: ', this.hDeviceId, this.areaId, this.idProjectSelected, this.signalIsOn);
    if (!this.signalIsOn) {
      this.pageStatus = PageStatus.Loading;
      this.getOfflineDashboard();
    } else {
      this.pageStatus = PageStatus.Loading;
      this.updateToplogyStatus();
      this.updateRecordingInterval = setInterval(() => {
        this.updateToplogyStatus();
      }, 60000);
      if (this.showAreas) {
        this.getRealTimeDashboard();
      } else {
        this.getRealTimeDashboard();
      }
    }
  }

  private getOfflineDashboard() {
    const responseHandler = (res: Dashboard[]) => {
      console.log('getOfflineDashboard', res);
      this.currentDashboard = res[0];
      this.currentDashboardId = this.currentDashboard?.id;
      this.widgetLayoutReady = false;
      // debounce 500ms to handle multiple packetsInDashboard update
      this.offlineDataService.resetService(this.idProjectSelected).pipe(debounceTime(500)).subscribe(response => {
        // reset packetsInDashboard only if the current packets are different from the old ones
        if (this.packetsInDashboard.sort().join(',') !== [...response].sort().join(',')) {
          this.packetsInDashboard = [...response];
        }
      });
      this.algorithmOfflineDataService.resetService(this.idProjectSelected);
      this.pageStatus = PageStatus.Standard;
    };
    const errorHandler = error => {
      this.pageStatus = PageStatus.Error;
    };
    if (this.showAreas) {
      this.dashboardConfigService.getOfflineDashboardFromArea(this.areaId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    } else if (this.showHDevice) {
      this.dashboardConfigService.getOfflineDashboardFromHDevice(this.hDeviceId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    } else {
      this.dashboardConfigService.getOfflineDashboardFromProject(this.idProjectSelected)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    }
  }
  private getRealTimeDashboard() {
    const errorHandler = error => {
      this.logger.error(error);
      this.pageStatus = PageStatus.Error;
    };
    const responseHandler = (dashboardRes: Dashboard[]) => {
      try {
        this.currentDashboard = dashboardRes[0];
        this.currentDashboardId = this.currentDashboard.id;
        if (!this.showAreas) {
          localStorage.setItem('last-dashboard-project', String(this.idProjectSelected));
        }
        this.pageStatus = PageStatus.Standard;
      } catch (error) {
        errorHandler(error);
      }
    };
    if (this.showAreas) {
      this.dashboardConfigService.getRealtimeDashboardFromArea(this.areaId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    } else if (this.showHDevice) {
      console.log('getRealtimeDashboardFromHDevice', this.hDeviceId, this.showHDevice);
      this.dashboardConfigService.getRealtimeDashboardFromHDevice(this.hDeviceId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    } else {
      // load project realtime Dashboard
      this.dashboardConfigService.getRealtimeDashboardFromProject(this.idProjectSelected)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    }
  }

  topologyResTimeChange(value) {
    if (this.dataRecordingStatus === 1 && value.timeMs >= 0) {
      this.dataRecordingStatus = TopologyStatus.On;
    }
  }

  onDashboardViewEvent(event){
    if (event === 'widgetsLayout:ready') {
      if (!this.widgetLayoutReady) {
        this.cd.detectChanges();
      }
      this.widgetLayoutReady = true;
    }
  }

  getCurrentProjectData(idProjectSelected: number, name: string): any {
    return this.hProjectList.find(el => el.id === idProjectSelected)[name];
  }
}
