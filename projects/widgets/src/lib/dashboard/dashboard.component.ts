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
import { AlgorithmOfflineDataService, Area, AreasService, Dashboard, HProject, Logger, LoggerService, OfflineDataService } from 'core';
import { debounceTime, Subject, Subscription, takeUntil } from 'rxjs';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { DashboardPreset, DashboardPresetModel } from './model/dashboard.model';

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

  @Input() idProjectSelected: number | undefined = undefined;

  currentDashboardId: number;

  currentDashboard: Dashboard;

  currentDashboardType: Dashboard.DashboardTypeEnum;

  recordStateInLoading = true;

  updateRecordingInterval;

  upTimeSec;

  packetsInDashboard: number[] = [];

  @Input() areaId: number | undefined = undefined;
  areaPath: Area[];
  @Input() showAreas = false;
  areaListOptions = [] as any[];
  selectedAreaId: number;

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
  @Input() enableChangeEventNotification: boolean | undefined = undefined;
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
      enableChangeEventNotification: false,
      enableTopologyToolbar: false,
      enableStreamControl: false,
      enableOnlineOffline: false,
      enableBreadcrumb: false
    },
    minimal: {
      enableAddWidget: false,
      enableProjectSelection: false,
      enableProjectEdit: false,
      enableChangeEventNotification: false,
      enableTopologyToolbar: true,
      enableStreamControl: true,
      enableOnlineOffline: true,
      enableBreadcrumb: false
    },
    full: {
      enableAddWidget: true,
      enableProjectSelection: true,
      enableProjectEdit: true,
      enableChangeEventNotification: true,
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
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private loggerService: LoggerService
  ) {
    this.offlineWidgetStatus = PageStatus.Standard;
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(DashboardComponent.name);
  }

  ngOnInit() {
    if (!this.areaId) {
      this.showAreas = this.activatedRoute.snapshot.routeConfig.path.startsWith('areas/');
    }
    if (!this.showAreas && !this.idProjectSelected) {
      if (this.activatedRoute.snapshot.queryParams.projectId) {
        this.idProjectSelected = +this.activatedRoute.snapshot.queryParams.projectId;
        localStorage.setItem('last-dashboard-project', String(this.idProjectSelected));
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
    } else {
      this.getProjectList();
    }
    this.applyPreset();

  }

  ngAfterViewInit(): void {
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
    localStorage.setItem('last-dashboard-project', String(this.idProjectSelected));
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
      this.getRealTimeDashboard(event.value);
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
        this.getRealTimeDashboard(this.areaId);
      } else {
        this.getRealTimeDashboard(this.idProjectSelected);
      }
    }
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
    this.dashboardView.dashboardLayout.dashboard.forEach(widget => {
      if (widget?.instance?.toolbar.config.showPlay) {
        // handle only with widgets which have play/pause button on their toolbar
        widget.instance.onDashboardPlay(this.streamIsOn);
      }
    });
  }

  changeEventNotificationState(event) {
    this.eventNotificationIsOn = !this.eventNotificationIsOn;
    this.dashboardConfigService.eventNotificationState.next(this.eventNotificationIsOn);
  }

  changeTopologyState(event) {
    this.dataRecordingIsOn = event.dataRecordingIsOn;
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
    widgetModalRef.afterClosed().subscribe(res => {
      this.dashboardView?.onWidgetsAdd(res);
    });
  }

  timeLineSelection(event: Date[]) {
    if (event[0] && event[1]) {
      this.offlineWidgetStatus = PageStatus.Loading;
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
              if (!this.idProjectSelected) {
                this.idProjectSelected = this.hProjectListOptions[0].id;
                localStorage.setItem('last-dashboard-project', String(this.idProjectSelected));
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
        this.getRealTimeDashboard(this.areaId);
      } else {
        this.getRealTimeDashboard(this.idProjectSelected);
      }
    }
  }

  private getOfflineDashboard() {
    const responseHandler = (res: Dashboard[]) => {
      this.currentDashboard = res[0];
      this.currentDashboardId = this.currentDashboard?.id;
      this.widgetLayoutReady = false;
      // debounce 500ms to handle multiple packetsInDashboard update
      this.offlineDataService.resetService(this.idProjectSelected).pipe(debounceTime(500)).subscribe(response => {
        this.packetsInDashboard = [...response];
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
    } else {
      this.dashboardConfigService.getOfflineDashboardFromProject(this.idProjectSelected)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    }
  }
  private getRealTimeDashboard(id: number) {
    const errorHandler = error => {
      this.logger.error(error);
      this.pageStatus = PageStatus.Error;
    };
    const responseHandler = (dashboardRes: Dashboard[]) => {
      try {
        this.currentDashboard = dashboardRes[0];
        this.currentDashboardId = this.currentDashboard.id;
        this.pageStatus = PageStatus.Standard;
      } catch (error) {
        errorHandler(error);
      }
    };
    if (this.showAreas) {
      this.dashboardConfigService.getRealtimeDashboardFromArea(id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(responseHandler, errorHandler);
    } else {
      // load project realtime Dashboard
      this.dashboardConfigService.getRealtimeDashboardFromProject(id)
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
