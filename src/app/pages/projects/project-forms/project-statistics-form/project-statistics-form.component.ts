import { Component, OnDestroy, ElementRef, ViewChild, Input, Injector, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { SelectOption } from '@hyperiot/components';

import { Algorithm, AlgorithmsService, HProject, HProjectAlgorithm, HprojectalgorithmsService } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { CronOptions } from 'ngx-cron-editor';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { StatisticInputDefinitionComponent } from './statistic-input-definition/statistic-input-definition.component';

@Component({
  selector: 'hyt-project-statistics-form',
  templateUrl: './project-statistics-form.component.html',
  styleUrls: ['./project-statistics-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectStatisticsFormComponent extends ProjectFormEntity implements OnInit, OnChanges, AfterViewInit, OnDestroy {

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
      this.divHeight = this.overlayHeight.nativeElement.clientHeight;
    }
  }

  entity = {} as HProjectAlgorithm;

  entityFormMap = {
    cronExpression: {
      field: 'cronExpression',
      default: ''
    }
  };

  id: number; // <-- this could be made private

  @Input()
  currentProject: HProject;

  algorithmList: Algorithm[];
  algorithmOptions: SelectOption[] = [];
  selectedAlgorithm: Algorithm;

  @ViewChild('statisticInputDefinition')
  statisticInputDefinition: StatisticInputDefinitionComponent;

  public cronOptions: CronOptions = {
    formInputClass: 'form-control cron-editor-input',
    formSelectClass: 'form-control cron-editor-select',
    formRadioClass: 'cron-editor-radio',
    formCheckboxClass: 'cron-editor-checkbox',
    defaultTime: '00:00:00',
    hideMinutesTab: false,
    hideHourlyTab: false,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: false,
    hideSpecificWeekDayTab: false,
    hideSpecificMonthWeekTab: false,
    use24HourTime: true,
    hideSeconds: false,
    cronFlavor: 'standard'
  };

  showCover = false;

  private activatedRouteSubscription: Subscription;

  form = new FormGroup({
    cronExpression: new FormControl('0 0 1/1 * *')
  });

  constructor(
    injector: Injector,
    private algorithmsService: AlgorithmsService,
    private hProjectAlgorithmsService: HprojectalgorithmsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formTemplateId = 'container-statistic-form';
    this.hideDelete = true;
    this.longDefinition = this.entitiesService.statistic.longDefinition;
    this.formTitle = this.entitiesService.statistic.formTitle;
    this.icon = this.entitiesService.statistic.icon;
    this.activatedRouteSubscription = this.activatedRoute.parent.params.subscribe(routeParams => {
      if (routeParams.projectId) {
        this.currentProject = {id: routeParams.projectId, entityVersion: null}; // read id of project
        this.loadData();
      }
    });
  }

  ngOnInit() {
    this.algorithmsService.findAllAlgorithm().subscribe((res) => {
      this.algorithmList = res;
      this.algorithmOptions = this.algorithmList
      .map(algorithm => ({ value: algorithm, label: algorithm.name }));
    });
    this.form.patchValue({cronExpression: '0 0 1/1 * *'});
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // this.loadEmpty();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  algorithmChanged(event): void {
    this.selectedAlgorithm = event.value;
  }

  cancel() {
    this.resetErrors();
    this.resetForm();
    this.editMode = false;
    this.showCancel = false;
  }

  delete(successCallback, errorCallback) {
    this.hProjectAlgorithmsService.deleteHProjectAlgorithm(this.entity.id).subscribe((res) => {
      this.resetErrors();
      this.resetForm();
      this.updateSummaryList();
      this.showCancel = false;
      if (successCallback) { successCallback(); }
    }, (err) => {
      if (errorCallback) { errorCallback(); }
    });
  }

  edit(hProjectAlgorithm?: HProjectAlgorithm, readyCallback?) {
    const proceedWithEdit = () => {
      this.editMode = true;
      this.showCancel = true;
      super.edit(hProjectAlgorithm, () => {
        delete this.entity['name']; // this property is set on cloning, but HProjectAlgorithm does not have it
        if (hProjectAlgorithm && this.algorithmOptions.some(x => x.value.id === this.entity.algorithm.id)) {
          this.selectedAlgorithm = this.algorithmOptions.find(x => x.value.id === this.entity.algorithm.id).value;
        }
        this.form.get('algorithm-name').setValue(this.selectedAlgorithm);
        if (readyCallback) {
          readyCallback();
        }
      });
    };
    const canDeactivate = this.canDeactivate();
    if (typeof canDeactivate === 'boolean' && canDeactivate === true) {
      proceedWithEdit();
    } else {
      (canDeactivate as Observable<any>).subscribe((res) => {
        if (res) {
          proceedWithEdit();
        }
      });
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

  isDirty() {
    return this.editMode && super.isDirty();
  }

  loadData() {
    this.updateSummaryList();
    this.entityEvent.emit({
      event: 'treeview:focus',
      id: this.currentProject.id, type: 'statistics'
    });
  }

  loadEmpty() {
    this.form.reset();
    this.entity = { ...this.entitiesService.statistic.emptyModel };
    this.selectedAlgorithm = this.entity.algorithm;
    this.edit();
  }

  loadHPackets() {
    this.statisticInputDefinition.loadHPackets();
  }

  save(successCallback, errorCallback) {
    this.saveHProjectAlgorithm(successCallback, errorCallback);
  }

  private saveHProjectAlgorithm(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const hProjectAlgorithm = this.entity;
    hProjectAlgorithm.algorithm = this.selectedAlgorithm;
    hProjectAlgorithm.project = this.currentProject;
    hProjectAlgorithm.config = this.selectedAlgorithm.baseConfig;
    hProjectAlgorithm.cronExpression = this.form.get('cronExpression').value;

    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.updateSummaryList();
      this.showCancel = false;
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
    };

    if (hProjectAlgorithm.id) {
      this.hProjectAlgorithmsService.updateHProjectAlgorithm(hProjectAlgorithm).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
      hProjectAlgorithm.entityVersion = 1;
      this.hProjectAlgorithmsService.saveHProjectAlgorithm(hProjectAlgorithm).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
        this.loadingStatus = LoadingStatusEnum.Error;
      });
    }

  }

  setErrors(err) {

    if (err.error && err.error.type) {
      console.log('TODO');
      switch (err.error.type) {
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

  updateSummaryList() {
    this.hProjectAlgorithmsService.findByHProjectId(this.currentProject.id).subscribe((hProjectAlgorithms: HProjectAlgorithm[]) => {
      this.summaryList = {
        title: this.formTitle,
        list: hProjectAlgorithms.map((x) => ({ name: x.algorithm.name, description: x.algorithm.description, data: x }) as SummaryListItem)
      };
    });
  }

}
