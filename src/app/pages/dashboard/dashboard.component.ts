import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { DashboardConfigService } from './dashboard-config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import { Dashboard, HProject } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { RouterLink, Router, ActivatedRoute, RouterOutlet } from '@angular/router';

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

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  dashboardList: Dashboard[] = [];

  hProjectList: HProject[] = [];

  hProjectListOptions: HytSelectOption[] = [];

  PageStatus = PageStatus;

  pageStatus: PageStatus = PageStatus.Loading;

  signalIsOn: boolean = true;

  streamIsOn: boolean = true;

  defaultProjectSelected: number;

  currentDashboardId: number;

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private route: Router
  ) { }

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
            this.defaultProjectSelected = this.hProjectListOptions.find(x=>(x.id == this.dashboardList[0].hproject.id)).value;
            this.currentDashboardId = this.dashboardList[0].id;
          } catch (error) {
            
          }
          this.pageStatus = PageStatus.Standard;
          console.log(this.defaultProjectSelected)

        } else if (this.dashboardList.length == 0) {
          
          this.defaultProjectSelected = this.hProjectListOptions[0].value;
          this.currentDashboardId = this.defaultProjectSelected[0].id;

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

    try {
      this.currentDashboardId = this.dashboardList.find(x => (x.hproject.id == event.value)).id;
    } catch (error) {}

    console.log(this.currentDashboardId)
    
  }

  changeSignalState(event){
    this.signalIsOn = !this.signalIsOn;
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
  }

  openAddWidget(){
    
  }

}
