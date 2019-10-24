import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { ProjectDetailEntity, LoadingStatusEnum, SubmitMethod } from '../project-detail-entity';

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
    this.longDefinition = 'project long definition';//@I18N@
    this.routerSubscription = this.router.events.subscribe((rl) => {
      this.submitMethod = SubmitMethod.Put;
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

    const responseHandler = (res) => {
      this.project = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: this.project.id, name: this.project.name
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };

    if (this.submitMethod == SubmitMethod.Post) {
      let p: HProject = {
        entityVersion: 1,
        name: this.form.get('hproject-name').value,
        description: this.form.get('hproject-description').value,
        user: this.getUser()
      }
      this.hProjectService.saveHProject(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      let p = this.project;
      p.name = this.form.get('hproject-name').value;
      p.description = this.form.get('hproject-description').value;
      this.hProjectService.updateHProject(p).subscribe(responseHandler, (err) => {
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
      // request navigate to project list when the project itself is deleted
      this.entityEvent.emit({
        event: 'entity:delete',
        exitRoute: ['/projects']
      });
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
      errorCallback && errorCallback(err);
    });
  }
}

