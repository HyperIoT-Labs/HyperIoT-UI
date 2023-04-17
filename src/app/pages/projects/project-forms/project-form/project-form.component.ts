import { Component, OnDestroy, ViewChild, ElementRef, Injector, ViewEncapsulation, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { HprojectsService, HProject } from 'core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { HytModalService } from 'components';

@Component({
  selector: 'hyt-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectFormComponent extends ProjectFormEntity implements AfterViewInit, OnDestroy {

  private overlayHeight: ElementRef;
  showPreloader: boolean;
  divHeight: number;

  @ViewChild('overlayHeight') set content(content: ElementRef) {

    if (!content) {

      this.showPreloader = false;
      return;

    } else {

      this.showPreloader = true;
      this.overlayHeight = content;

    }

  }

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
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(injector,cdr);
    this.formTemplateId = 'project-form';
    this.longDefinition = this.entitiesService.project.longDefinition;
    this.formTitle = this.entitiesService.project.formTitle;
    this.icon = this.entitiesService.project.icon;
  }

  ngAfterViewInit() {

    super.ngAfterViewInit();
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
    this.cdr.detectChanges();
    /******* VALUE LOADING OVERLAY *******/
    this.divHeight = this.overlayHeight.nativeElement.clientHeight;
    /******* END VALUE LOADING OVERLAY *******/
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
    this.projectsService.deleteProject(this.entity.id);
    this.projectsService.subProjects.subscribe({
      next: (v) => {
        switch (v.state) {
          case 'delete-loading':
            this.loadingStatus = LoadingStatusEnum.Saving;
            break;
          case 'delete-success':
            this.loadingStatus = LoadingStatusEnum.Ready;
            successCallback && successCallback(v.projectToDelete);
            // request navigate to project list when the project itself is deleted
            this.entityEvent.emit({
              event: 'entity:delete',
              exitRoute: 'out'
              // exitRoute: ['/projects']
            });
            break;
          case 'delete-error':
            this.loadingStatus = LoadingStatusEnum.Error;
            errorCallback && errorCallback;
            break;
          default:
            break;
        }
      }
    })
  }

  setErrors(err) {

    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: $localize`:@@HYT_unavailable_project_name:Unavailable project name`, field: 'hproject-name', invalidValue: '' }];
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

  getCustomClass() {

    if (this.showPreloader) {

      if (this.divHeight > 353) { /* BIG */
        return 'loading-logo display-logo big-bg';
      }

      if (this.divHeight >= 293 && this.divHeight <= 352) { /* MEDIUM */
        return 'loading-logo display-logo medium-bg';
      }

      if (this.divHeight >= 233 && this.divHeight <= 292) { /* SMALL */
        return 'loading-logo display-logo small-bg';
      }

      if (this.divHeight >= 182 && this.divHeight <= 232) { /* X-SMALL */
        return 'loading-logo display-logo x-small-bg';
      }

      if (this.divHeight < 182) { /* X-SMALL */
        return '';
      }

    } else {
      return '';
    }

  }

}
