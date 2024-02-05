import {Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {AreasService, Area, HprojectsService, HProject, Logger, LoggerService} from 'core';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

enum PageStatus {
  Loading = 0,
  Ready = 1,
  New = 2,
  Error = -1
}

@Component({
  selector: 'hyt-areas-view',
  templateUrl: './areas-view.component.html',
  styleUrls: ['./areas-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasViewComponent implements OnDestroy {

  PageStatus = PageStatus;
  pageStatus: PageStatus;

  userProjectsOptions: any[];
  selectedProjectOption: number;
  projectId: number;
  areaId: number;
  areaList: Area[] = [];
  areaPath: Area[] = [];
  /*
   * Variable used to verify the actual presence of the project id starting from the id inside the url
   */
  projectIdFinder: HProject;

  /*
   * logger service
   */
  private logger: Logger;
  /**
   * Subject for manage the open subscriptions
   * @protected
   */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private projectService: HprojectsService,
    private areaService: AreasService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AreasViewComponent');
    // Get Params from route
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.projectId = +this.activatedRoute.snapshot.params.projectId;
        this.areaId = +this.activatedRoute.snapshot.params.areaId;
        // load project data
        this.loadProjectsList();
    });
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  onSelectedProjectChange(e) {
    this.selectedProjectOption = e.value;
    this.areaId = 0; this.areaList = [];
    this.router.navigate(['/areas', e.value]);
  }

  onMainAreaClick(area: Area) {
    this.router.navigate(['/areas', this.projectId, area.id]);
  }

  private loadProjectsList() {
    this.pageStatus = PageStatus.Loading;
    this.projectService.findAllHProject()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(  (projectList: HProject[]) => {
        this.logger.debug('[loadProjectsList] Get project list ', projectList);
        // Check if the project id in the url corresponds to a real project and if so assign it
        this.projectIdFinder = projectList.find((project) => project.id === +this.projectId);
        if(this.projectIdFinder) {
          this.selectedProjectOption = this.projectIdFinder.id;
        }
        // Sort by date
        projectList.sort((a, b) => {
          if (a.entityModifyDate > b.entityModifyDate) { return -1; }
          if (a.entityModifyDate < b.entityModifyDate) { return 1; }
          return 0;
        });
        // select current project // TODO: this is not working =/ FIXME: !!!!
        if (!this.selectedProjectOption && projectList.length > 0) {
          this.projectId = this.selectedProjectOption = projectList[0].id;
          // Load autoselected project areas
          this.areaId = 0; this.areaList = [];
          this.router.navigate(['/areas', this.projectId]);
        }
        // populate hyt-select options
        this.userProjectsOptions = [];
        projectList.forEach(p => {
          this.userProjectsOptions.push({
            label: p.name,
            value: p.id
          })
        });
        this.apiSuccess(projectList);
        if (this.userProjectsOptions.length === 0) {
          this.pageStatus = PageStatus.New;
        }
    }, this.apiError);
  }

  apiSuccess(res) {
    this.pageStatus = PageStatus.Ready;
  }

  apiError(err) {
    this.pageStatus = PageStatus.Error;
  }

}
