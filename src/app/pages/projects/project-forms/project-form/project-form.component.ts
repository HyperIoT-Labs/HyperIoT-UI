import { Component, OnDestroy, ViewChild, ElementRef, Injector, ViewEncapsulation, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectFormComponent extends ProjectFormEntity implements AfterViewInit, OnDestroy {

  entity = {} as HProject;
  entityFormMap = {
    'hproject-name': {
      field: 'name'
    },
    'hproject-description': {
      field: 'description'
    }
  };

  id: number; // <-- this could be made private
  private routerSubscription: Subscription;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = this.entitiesService.project.longDefinition;
    this.formTitle = this.entitiesService.project.formTitle;
    this.icon = this.entitiesService.project.icon;
  }

  ngAfterViewInit(): void {
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.projectId) {
        this.id = params.projectId;
        this.load();
      } else {
        this.loadEmpty();
      }
      this.cdr.detectChanges();
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
      this.entityEvent.emit({
        event: 'pw:project-loaded',
        project: this.entity
      });
      this.edit();
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  loadEmpty() {
    this.form.reset();
    this.entity = { ...this.entitiesService.project.emptyModel };
    this.edit();
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

  setErrors(err) {

    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: this.i18n('HYT_unavaiable_project_name'), field: 'hproject-name', invalidValue: '' }];
          this.form.get('hproject-name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }

  }

}
