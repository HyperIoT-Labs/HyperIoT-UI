import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { ProjectDetailEntity, LoadingStatusEnum } from '../project-detail-entity';

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent extends ProjectDetailEntity implements OnDestroy {
  projectId: number;
  project: HProject = {} as HProject;

  private routerSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
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

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.saveProject(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteProject(successCallback, errorCallback);
  }

  private loadProject() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hProjectService.findHProject(this.projectId).subscribe((p: HProject) => {
      this.project = p;
      // update form data
      this.form.get('hproject-name')
        .setValue(p.name);
      this.form.get('hproject-description')
        .setValue(p.description);
      this.resetForm();
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    let p = this.project;
    p.name = this.form.get('hproject-name').value;
    p.description = this.form.get('hproject-description').value;
    p.user = this.getUser();
    p.entityVersion = 1;
    const responseHandler = (res) => {
      this.project = p = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: p.id, name: p.name
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };
    if (p.id) {
      this.hProjectService.updateHProject(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
      this.hProjectService.saveHProject(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }
  private deleteProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hProjectService.deleteHProject(this.project.id).subscribe((res) => {
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
      // navigate to project list when the project itself is deleted
      this.router.navigate(['/projects']);
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
      errorCallback && errorCallback(err);
    });
  }
}

