import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';
import { ActivatedRoute, Router } from '@angular/router';
import {AreasService, Area, HprojectsService, HProject, Logger, LoggerService} from '@hyperiot/core';
import { HytModalService } from '@hyperiot/components';
import { AreaMapComponent } from '../../projects/project-forms/areas-form/area-map/area-map.component';
import { HttpClient } from '@angular/common/http';

enum PageStatus {
  Loading = 0,
  Ready = 1,
  Error = -1
}

@Component({
  selector: 'hyt-areas-view',
  templateUrl: './areas-view.component.html',
  styleUrls: ['./areas-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasViewComponent {

  @ViewChild('map')
  mapComponent: AreaMapComponent;
  @ViewChild('treeView')
  treeView: HytTreeViewProjectComponent;

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

  constructor(
    private projectService: HprojectsService,
    private areaService: AreasService,
    private modalService: HytModalService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AreasViewComponent');
    // Get Params from route
    this.activatedRoute.params.subscribe(params => {
      this.projectId = +this.activatedRoute.snapshot.params.projectId;
      this.areaId = +this.activatedRoute.snapshot.params.areaId;
      // load project data
      this.loadProjectsList();
    });
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
    this.projectService.findAllHProject().subscribe(  (projectList: HProject[]) => {
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
    }, this.apiError);
  }

  apiSuccess(res) {
    this.pageStatus = PageStatus.Ready;
  }

  apiError(err) {
    this.pageStatus = PageStatus.Error;
  }

}
