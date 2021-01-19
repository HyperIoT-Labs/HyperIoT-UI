import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HytModalRef, HytModalService } from '@hyperiot/components';
import { AlgorithmOfflineDataService, Area, AreasService, Dashboard, DashboardOfflineDataService, HProject } from '@hyperiot/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';

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
}

@Component({
  selector: 'hyt-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(DashboardViewComponent)
  dashboardView: DashboardViewComponent;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  dashboardList: Dashboard[] = [];

  hProjectList: HProject[] = [];

  hProjectListOptions: HytSelectOption[] = [];

  PageStatus = PageStatus;

  pageStatus: PageStatus = PageStatus.Loading;

  signalIsOn = true;

  streamIsOn = true;

  dataRecordingIsOn = false;

  eventNotificationIsOn = false;

  dataRecordingStatus = TopologyStatus.Off;

  idProjectSelected: number;

  currentDashboardId: number;

  currentDashboard: Dashboard;

  currentDashboardType: Dashboard.DashboardTypeEnum;

  recordStateInLoading = true;

  updateRecordingInterval;

  upTimeSec;

  widgetModalRef: HytModalRef;

  packetsInDashboard: number[] = [];

  areaId: number;
  areaPath: Area[];
  showAreas = false;
  areaListOptions = [] as any[];
  selectedAreaId: number;

  /**
   * It checks when offline data have been loaded
   */
  offlineWidgetStatus: PageStatus;

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private dashboardOfflineDataService: DashboardOfflineDataService,
    private algorithmOfflineDataService: AlgorithmOfflineDataService,
    private areaService: AreasService,
    private hytModalService: HytModalService,
    private activatedRoute: ActivatedRoute
  ) {
    this.offlineWidgetStatus = PageStatus.Standard;
    dashboardOfflineDataService.countEventSubject.subscribe(res => {
      this.offlineWidgetStatus = res;
    });
  }

  ngOnInit() {
    this.showAreas = this.activatedRoute.snapshot.routeConfig.path.startsWith('areas/');
    if (this.showAreas) {
      // load area realtime Dashboard
      this.areaId = +this.activatedRoute.snapshot.params.areaId;
      this.idProjectSelected = +this.activatedRoute.snapshot.params.projectId;
      if (this.areaId) {
        this.areaService.getAreaPath(this.areaId).subscribe((areas: Area[]) => {
          this.areaPath = areas;
        });
      }
      this.showDashboard();
    } else {
      this.getProjectList();
    }
  }

  ngOnDestroy() {
    if (this.updateRecordingInterval) {
      clearInterval(this.updateRecordingInterval);
    }

    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  onSelectChange(event) {
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
      this.getRealTimeDashboard(event.value);
    }
  }

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
    this.dashboardConfigService.getRecordingStatus(this.idProjectSelected)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          if (res != null && res != undefined && res.status.toLowerCase() === 'active') {
            this.dataRecordingIsOn = true;
            this.dataRecordingStatus = (this.dataRecordingStatus == 2) ? TopologyStatus.On : TopologyStatus.Activated;
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
          console.error(error);
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
    this.widgetModalRef = this.hytModalService.open(AddWidgetDialogComponent, { signalIsOn: this.signalIsOn });
    this.widgetModalRef.onClosed.subscribe(res => {
      this.dashboardView.onWidgetsAdd(res);
    });
  }

  timeLineSelection(event: Date[]) {
    if (event[0] && event[1]) {
      this.offlineWidgetStatus = PageStatus.Loading;
      this.dashboardOfflineDataService.getEventCount(event[0].getTime(), event[1].getTime());
    } else {
      this.dashboardOfflineDataService.getEventCountEmpty();
    }
  }

  private getProjectList() {
    this.dashboardConfigService.getProjectsList()
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

            this.hProjectListOptions.sort((a, b) => {
              if (a.entityModifyDate > b.entityModifyDate) { return -1; }
              if (a.entityModifyDate < b.entityModifyDate) { return 1; }
              return 0;
            });

            if (this.hProjectListOptions.length > 0) {
              this.idProjectSelected = this.hProjectListOptions[0].id;
              this.showDashboard();
            } else {
              this.pageStatus = PageStatus.New;
            }

          } catch (error) {
            console.error(error);
            this.pageStatus = PageStatus.Error;
          }

        },
        error => {
          this.pageStatus = PageStatus.Error;
        }

      );
  }

  private showDashboard() {
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

  private getOfflineDashboard() {
    const responseHandler = (res: Dashboard[]) => {
      this.currentDashboard = res[0];
      this.currentDashboardId = this.currentDashboard.id;
      // this.extractPacketsFromWidgets(this.currentDashboard.widgets);
      this.dashboardOfflineDataService.resetService(this.idProjectSelected).subscribe(res => {
        this.packetsInDashboard = [...res];
      });
      this.algorithmOfflineDataService.resetService(this.idProjectSelected);
      this.pageStatus = PageStatus.Standard;
    };
    const errorHandler = error => {
      this.pageStatus = PageStatus.New;
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
      console.error(error);
      this.pageStatus = PageStatus.New;
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
    if (this.dataRecordingStatus == 1 && value.timeMs >= 0) {
      this.dataRecordingStatus = TopologyStatus.On;
    }
  }
}
