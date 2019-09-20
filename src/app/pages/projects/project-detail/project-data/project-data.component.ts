import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { ProjectDetailComponent } from '../project-detail.component';
import { ProjectDetailEntity } from '../project-detail-entity';

enum LoadingStatusEnum {
  Ready,
  Loading,
  Saving,
  Error
}

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent implements ProjectDetailEntity, OnDestroy {
  projectId: number;
  project: HProject = {} as HProject;

  form: FormGroup;
  originalValue: string;

  LoadingStatus = LoadingStatusEnum;
  loadingStatus = LoadingStatusEnum.Ready;
  validationError = [];

  isProjectEntity = true;
  treeHost: ProjectDetailComponent = null;

  private routerSubscription: Subscription;

  constructor(
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
    this.originalValue = JSON.stringify(this.form.value);
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.projectId = this.activatedRoute.snapshot.params.projectId;
        this.loadProject();
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.treeHost.openSaveDialog();
    }
    return true;
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.saveProject(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteProject(successCallback, errorCallback);
  }
  isValid(): boolean {
    return this.form.valid;
  }
  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }
  getError() {
    return this.validationError;
  }

  private loadProject() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hProjectService.findHProject(this.projectId).subscribe((p: HProject) => {
      this.project = p;
      // update form data
      this.form.get('name')
        .setValue(p.name);
      this.form.get('description')
        .setValue(p.description);
      this.originalValue = JSON.stringify(this.form.value);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.validationError = [];
    let p = this.project;
    p.name = this.form.get('name').value;
    p.description = this.form.get('description').value;
    this.hProjectService.updateHProject(p).subscribe((res) => {
      this.project = p = res;
      this.originalValue = JSON.stringify(this.form.value);
      this.treeHost && this.treeHost.updateNode({id: p.id, name: p.name});
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      errorCallback && errorCallback(err);
      if (err.error && err.error.validationErrors) {
        this.validationError = err.error.validationErrors;
        this.loadingStatus = LoadingStatusEnum.Ready;
      } else {
        this.loadingStatus = LoadingStatusEnum.Error;
      }
    });
  }
  private deleteProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hProjectService.deleteHProject(this.project.id).subscribe((res) => {
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // navigate to project list when the project itself is deleted
      this.router.navigate(['/projects']);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
