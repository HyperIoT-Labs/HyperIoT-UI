import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HytModalRef, HytModalService } from '@hyperiot/components';
import { Dashboard, DashboardOfflineDataService, DashboardWidget, HProject } from '@hyperiot/core';
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
  @ViewChild(DashboardViewComponent, { static: false })
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

  idProjectSelected: number;

  currentDashboardId: number;

  currentDashboard: Dashboard;

  currentDashboardType: Dashboard.DashboardTypeEnum;

  recordStateInLoading = true;

  updateRecordingInterval;

  upTimeSec;

  widgetModalRef: HytModalRef;

  packetsInDashboard: number[] = [];

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private dashboardOfflineDataService: DashboardOfflineDataService,
    private hytModalService: HytModalService
  ) { }

  getPacketsFromWidgets(widgets: DashboardWidget[]) {
    const packetsList = [];
    widgets.forEach(w => {
      try {
        const wConfig = JSON.parse(w.widgetConf).config;
        if (wConfig) {
          packetsList.push(wConfig.packetId);
        }
      } catch (e) { }
    });
    this.packetsInDashboard = [...packetsList];
  }

  ngOnInit() {

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

              this.updateToplogyStatus();
              this.updateRecordingInterval = setInterval(() => {
                this.updateToplogyStatus();
              }, 60000);

              this.dashboardConfigService.getRealtimeDashboardFromProject(this.idProjectSelected)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                  (dashboardRes: Dashboard[]) => {
                    try {
                      this.currentDashboard = dashboardRes[0];
                      this.currentDashboardId = this.currentDashboard.id;
                      this.pageStatus = PageStatus.Standard;
                    } catch (error) {
                      console.error(error);
                      this.pageStatus = PageStatus.New;
                    }
                  },
                  error => {
                    console.error(error);
                    this.pageStatus = PageStatus.New;
                  }
                );
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
    this.dashboardConfigService.getRealtimeDashboardFromProject(event.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: Dashboard[]) => {
          try {
            this.currentDashboard = res[0];
            this.currentDashboardId = this.currentDashboard.id;
            this.pageStatus = PageStatus.Standard;
          } catch (error) {
            this.pageStatus = PageStatus.New;
          }
        },
        error => {
          this.pageStatus = PageStatus.New;
        }
      );
  }

  changeSignalState(event) {
    if (this.signalIsOn) {
      this.signalIsOn = !this.signalIsOn;
      this.pageStatus = PageStatus.Loading;
      this.dashboardConfigService.getOfflineDashboardFromProject(this.idProjectSelected)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: Dashboard[]) => {
            this.currentDashboard = res[0];
            this.currentDashboardId = this.currentDashboard.id;
            this.getPacketsFromWidgets(this.currentDashboard.widgets);
            this.dashboardOfflineDataService.resetService(this.idProjectSelected, this.packetsInDashboard);
            this.pageStatus = PageStatus.Standard;
          },
          error => {
            this.pageStatus = PageStatus.New;
          }
        );
    } else {
      this.signalIsOn = !this.signalIsOn;
      this.pageStatus = PageStatus.Loading;
      this.dashboardConfigService.getRealtimeDashboardFromProject(this.idProjectSelected)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: Dashboard[]) => {
            try {
              this.currentDashboard = res[0];
              this.currentDashboardId = this.currentDashboard.id;
              this.pageStatus = PageStatus.Standard;
            } catch (error) {
              this.pageStatus = PageStatus.New;
            }
          },
          error => {
            this.pageStatus = PageStatus.New;
          }
        );
    }
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
  }

  changeTopologyState(event) {
    this.dataRecordingIsOn = event.dataRecordingIsOn;
    this.upTimeSec = event.upTimeSec;
  }

  updateToplogyStatus() {
    this.dashboardConfigService.getRecordingStatus(this.idProjectSelected)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          if (res != null && res != undefined && res.status.toLowerCase() === 'active') {
            this.dataRecordingIsOn = true;
            if (res.upTimeSec) {
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
            this.upTimeSec = undefined;
          }
          this.recordStateInLoading = false;
        },
        error => {
          this.dataRecordingIsOn = false;
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
    this.widgetModalRef = this.hytModalService.open(AddWidgetDialogComponent);
    this.widgetModalRef.onClosed.subscribe(res => {
      this.dashboardView.onWidgetsAdd(res);
    });
  }

  timeLineSelection(event: Date[]) {
    this.dashboardOfflineDataService.getHPacketMap(event[0].getTime(), event[1].getTime());
  }

  // TODO getOfflineDashboardFromProject() should not be called because currentDashboard should be updated automatically
  // TODO settimeout is used to wait the dashboard configuration to be saved before getOfflineDashboardFromProject(). Remove it.
  onWidgetEvent() {
    setTimeout(() => {
      if (!this.signalIsOn) {
        this.dashboardConfigService.getOfflineDashboardFromProject(this.idProjectSelected)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (res: Dashboard[]) => {
              this.currentDashboard = res[0];
              this.currentDashboardId = this.currentDashboard.id;
              this.getPacketsFromWidgets(this.currentDashboard.widgets);
              this.dashboardOfflineDataService.resetService(this.idProjectSelected, this.packetsInDashboard);
              this.pageStatus = PageStatus.Standard;
            },
            error => {
              this.pageStatus = PageStatus.New;
            }
          );
      }
    }, 500);
  }

}
