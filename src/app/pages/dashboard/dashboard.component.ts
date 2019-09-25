import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { DashboardConfigService } from './dashboard-config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import { Dashboard, HProject } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { RouterLink, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { WidgetsLayoutComponent } from './widgets-layout/widgets-layout.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { WidgetSettingsDialogComponent } from './widget-settings-dialog/widget-settings-dialog.component';

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
  // @ViewChild(WidgetsLayoutComponent, { static: false }) dashboardLayout : WidgetsLayoutComponent;
  @ViewChild(DashboardViewComponent, { static: false })
  dashboardView: DashboardViewComponent;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  dashboardList: Dashboard[] = [];

  hProjectList: HProject[] = [];

  hProjectListOptions: HytSelectOption[] = [];

  PageStatus = PageStatus;

  pageStatus: PageStatus = PageStatus.Loading;

  signalIsOn: boolean = true;

  streamIsOn: boolean = true;

  idProjectSelected: number;

  currentDashboardId: number;

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private route: Router
  ) {

  }

  ngOnInit() {

    this.dashboardConfigService.getAllDashboardsAndProjects()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      ([res1, res2]) => {
        try {
          this.hProjectList = [...res1];
          this.hProjectListOptions = <HytSelectOption[]>this.hProjectList;
          this.hProjectListOptions.forEach(element => {
            element.label = element.name;
            element.value = element.id;
          });
        } catch (error) { }

        try {
          this.dashboardList = [...res2];
        } catch (error) { }

      },
      error => {
        this.pageStatus = PageStatus.Error;
      },
      ()=> {

        this.hProjectListOptions.sort(function(a, b){
          if(a.entityModifyDate > b.entityModifyDate) { return -1; }
          if(a.entityModifyDate < b.entityModifyDate) { return 1; }
          return 0;
        })
        console.log(this.hProjectListOptions)

        this.dashboardList.sort(function(a, b){
          if(a.entityModifyDate > b.entityModifyDate) { return -1; }
          if(a.entityModifyDate < b.entityModifyDate) { return 1; }
          return 0;
        })

        console.log(this.dashboardList)

        if(this.dashboardList.length > 0) {
          
          try {
            this.idProjectSelected = this.hProjectListOptions.find(x=>(x.id == this.dashboardList[0].hproject.id)).value;
            this.currentDashboardId = this.dashboardList[0].id;
          } catch (error) {
            
          }
          this.pageStatus = PageStatus.Standard;
          console.log(this.idProjectSelected)

        } else if (this.dashboardList.length == 0) {
          
          this.idProjectSelected = this.hProjectListOptions[0].value;
          this.currentDashboardId = this.idProjectSelected[0].id;

          this.pageStatus = PageStatus.New;
        } else {
          this.pageStatus = PageStatus.Error;
        }
        
      }
    )

  }

  ngOnDestroy() {
    if(this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  onSelectChange(event) {

    this.idProjectSelected = event.value;

    console.log("project id selected", event.value)
    try {
      this.currentDashboardId = this.dashboardList.find(x => (x.hproject.id == event.value)).id;
      this.pageStatus = PageStatus.Standard;
    } catch (error) {
      this.createDashboard(event.value);
      this.currentDashboardId = null;
      this.pageStatus = PageStatus.New;
    }

    console.log("dashboard id selected", this.currentDashboardId)
    
  }

  changeSignalState(event){
    this.signalIsOn = !this.signalIsOn;
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
  }



  createDashboard(idProject: number) {

    let dashboard: Dashboard = {
      dashboardType: "REALTIME",
      entityVersion: 1,
      hproject: this.hProjectList.find(x => (x.id == idProject)),
      // name: this.hProjectList.find(x => (x.id == idProject)).name
    };

    // this.dashboardConfigService.saveDashboard(dashboard)
    console.log(dashboard)

  }

  saveDashboard() {
    this.dashboardView.saveDashboard();
  }

  // onActivate(childComponent) {
  //   if (childComponent instanceof AddWidgetDialogComponent) {
  //     childComponent.addWidgets.subscribe((widgets) => this.onWidgetsAdd(widgets));
  //   } else if (childComponent instanceof WidgetSettingsDialogComponent) {
  //     const widgetId = childComponent.getWidgetId();
  //     const widget = this.dashboardLayout.getItemById(widgetId);
  //     childComponent.setWidget(widget);
  //   }
  // }

  // saveDashboard() {
  //   this.dashboardLayout.saveDashboard();
  // }

  // onWidgetsAdd(widgetList: any[]) {
  //   widgetList.map((widget) => {
  //     this.dashboardLayout.addItem(widget);
  //   });
  // }

}
