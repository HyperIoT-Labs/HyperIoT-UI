import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { DashboardConfigService } from './dashboard-config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Dashboard, HProject } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';

enum PageStatus {
  Loading = 0,
  Standard = 1,
  New = 2,
  Error = -1
}

interface HytSelectOption extends HProject {
  label: string;
  value?: string;
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

  hProjectListOptions: HytSelectOption[];

  PageStatus = PageStatus;

  pageStatus: PageStatus = PageStatus.Loading;

  signalIsOn: boolean = true;

  streamIsOn: boolean = true;

  sortOptions: SelectOption[] = [
    { value: 'none', label: 'None' },
    { value: 'alfabetic-increasing', label: 'A-Z' },
    { value: 'alfabetic-decreasing', label: 'Z-A' },
    { value: 'date-increasing', label: 'Oldest' },
    { value: 'date-decreasing', label: 'Newest' }
  ];

  constructor(
    private dashboardConfigService: DashboardConfigService,
  ) { }

  ngOnInit() {

    this.dashboardConfigService.getProjectsList()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      res => {
        this.hProjectList = [...res];
        this.hProjectListOptions = <HytSelectOption[]>this.hProjectList;
        this.hProjectListOptions.forEach(element => {
          element.label = element.name;
        });
        console.log(this.hProjectListOptions)
      },
      err => {

      },
      () => {

      }
    )

    this.dashboardConfigService.getDashboardList()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      res => {
        this.dashboardList = [...res];
        console.log(this.dashboardList)
        if(this.dashboardList.length > 0) {
          this.pageStatus = PageStatus.Standard;
        } else if (this.dashboardList.length == 0) {
          this.pageStatus = PageStatus.New;

          this.dashboardList.sort(function(a, b){
            if(a.entityModifyDate > b.entityModifyDate) { return -1; }
            if(a.entityModifyDate < b.entityModifyDate) { return 1; }
            return 0;
          })

          this.dashboardList.forEach( element => {
            element
          })
        } else {
          this.pageStatus = PageStatus.Error;
        }
      },
      err => {
        this.pageStatus = PageStatus.Error;
      },
      () => {

      }
    )
    console.log(this.pageStatus)
  }

  ngOnDestroy() {
    if(this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  changeSignalState(event){
    this.signalIsOn = !this.signalIsOn;
  }

  changeStreamState(event) {
    this.streamIsOn = !this.streamIsOn;
  }

}
