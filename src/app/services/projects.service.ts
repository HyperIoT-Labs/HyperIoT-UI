import { Injectable } from '@angular/core';
import { HProjectService, HProject } from 'core';
import { Subject } from 'rxjs';

export interface ProjectsState {
  state: string;
  projectToDelete: number;
  projectList: HProject[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  subProjects = new Subject<ProjectsState>();

  nextProjects: ProjectsState = {
    state: 'initial',
    projectToDelete: null,
    projectList: []
  };

  constructor(
    private hProjectService: HProjectService
  ) { }

  updateProjectList() {
    this.hProjectService.cardsView().subscribe(
      res => {
        this.nextProjects.state = 'update-success';
        this.nextProjects.projectList = res;
        this.subProjects.next(this.nextProjects);
      },
      err => {
        this.nextProjects.state = 'update-error';
        this.subProjects.next(this.nextProjects);
      }
    );
  }

  deleteProject(projectId: number) {
    this.nextProjects.state = 'delete-loading';
    this.nextProjects.projectToDelete = projectId;
    this.subProjects.next(this.nextProjects);
    this.hProjectService.deleteHProject(projectId)
    .subscribe(
      (res) => {
        this.nextProjects.state = 'delete-success';
        this.nextProjects.projectList = this.nextProjects.projectList.filter(value => value.id !== projectId );
        this.subProjects.next(this.nextProjects);
      },
      (err) => {
        this.nextProjects.state = 'delete-error';
        this.subProjects.next(this.nextProjects);
      }
    );
  }

}
