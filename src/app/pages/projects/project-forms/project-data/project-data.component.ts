import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent extends ProjectFormEntity implements OnDestroy {
  entity = {} as HProject;
  entityFormMap = {
    'hproject-name': 'name',
    'hproject-description': 'description'
  };

  id: number; // <-- this could be made private
  private routerSubscription: Subscription;

  constructor(
    public formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'project long definition';//@I18N@
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.id = this.activatedRoute.snapshot.params.projectId;
        if (this.id) this.load();
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

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hProjectService.findHProject(this.id).subscribe((p: HProject) => {
      this.entity = p;
      this.edit();
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    let p = this.entity;
    p.name = this.form.get('hproject-name').value;
    p.description = this.form.get('hproject-description').value;
    p.user = this.getUser();
    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = p = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: p.id, name: p.name
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
    };
    if (p.id) {
      this.hProjectService.updateHProject(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
      p.entityVersion = 1;
      this.hProjectService.saveHProject(p).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }
  private deleteProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hProjectService.deleteHProject(this.entity.id).subscribe((res) => {
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

