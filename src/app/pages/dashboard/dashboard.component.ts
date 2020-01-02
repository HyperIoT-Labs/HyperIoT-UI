import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { Dashboard, HProject } from '@hyperiot/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
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

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private route: Router,
    private hytModalService: HytModalConfService,
    private hytModalServiceNew: HytModalService
  ) {

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

  openModal(id: string) {
    this.hytModalService.open(id);
  }

  closeModal(id: string) {
    this.hytModalService.close(id);
  }

  /************************************************************************************************************* Not used */

  createDashboard(idProject: number) {

    const dashboard: Dashboard = {
      dashboardType: 'REALTIME',
      entityVersion: 1,
      hproject: this.hProjectList.find(x => (x.id === idProject)),
      // name: this.hProjectList.find(x => (x.id == idProject)).name
    };

    // this.dashboardConfigService.saveDashboard(dashboard)
    // console.log(dashboard)

  }

  getAllDashboardAndProjects() {
    this.dashboardConfigService.getAllDashboardsAndProjects()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        ([res1, res2]) => {
          try {
            this.hProjectList = [...res1];
            this.hProjectListOptions = this.hProjectList as HytSelectOption[];
            this.hProjectListOptions.forEach(element => {
              element.label = element.name;
              element.value = element.id;
            });
          } catch (error) {
            this.pageStatus = PageStatus.Error;
          }

          try {
            this.dashboardList = [...res2];
          } catch (error) { }

        },
        error => {
          this.pageStatus = PageStatus.Error;
        },
        () => {

          this.hProjectListOptions.sort((a, b) => {
            if (a.entityModifyDate > b.entityModifyDate) { return -1; }
            if (a.entityModifyDate < b.entityModifyDate) { return 1; }
            return 0;
          });

          this.dashboardList.sort((a, b) => {
            if (a.entityModifyDate > b.entityModifyDate) { return -1; }
            if (a.entityModifyDate < b.entityModifyDate) { return 1; }
            return 0;
          });

          if (this.dashboardList.length > 0 && this.hProjectListOptions.length > 0) {

            try {
              this.idProjectSelected = this.hProjectListOptions.find(x => (x.id === this.dashboardList[0].hproject.id)).value;
              this.currentDashboardId = this.dashboardList[0].id;
            } catch (error) {

            }
            this.pageStatus = PageStatus.Standard;

          } else if (this.dashboardList.length === 0 && this.hProjectListOptions.length > 0) {

            this.idProjectSelected = this.hProjectListOptions[0].value;
            this.currentDashboardId = this.idProjectSelected[0].id;

            this.pageStatus = PageStatus.New;
          } else {
            this.pageStatus = PageStatus.Error;
          }

        }
      );
  }

}
