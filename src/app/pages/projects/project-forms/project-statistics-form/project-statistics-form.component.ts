import { Component, OnDestroy, ElementRef, ViewChild, Input, Injector, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { Option, SelectOption } from '@hyperiot/components';

import { Algorithm, AlgorithmConfig, AlgorithmsService, HProject, HProjectAlgorithm, HProjectAlgorithmConfig, HprojectalgorithmsService } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { CronOptions } from '@hyperiot/widgets';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { StatisticInputDefinitionComponent } from './statistic-input-definition/statistic-input-definition.component';

@Component({
  selector: "hyt-project-statistics-form",
  templateUrl: "./project-statistics-form.component.html",
  styleUrls: ["./project-statistics-form.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectStatisticsFormComponent
  extends ProjectFormEntity
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  private overlayHeight: ElementRef;
  showPreloader: boolean;
  divHeight: number;

  @ViewChild("overlayHeight") set content(content: ElementRef) {
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
    cronExpressionFC: {
      field: "cronExpression",
      default: "",
    },
    "hprojectalgorithm-name": {
      field: "name",
      default: "",
    },
  };

  id: number; // <-- this could be made private

  @Input()
  currentProject: HProject;

  algorithmList: Algorithm[];
  algorithmOptions: SelectOption[] = [];

  config: HProjectAlgorithmConfig;

  selectedAlgorithm: Algorithm;

  @ViewChild("statisticInputDefinition")
  statisticInputDefinition: StatisticInputDefinitionComponent;

  public cronExpression = "0 0 10 1 1/1 ? *";
  public isCronDisabled = false;
  public cronOptions: CronOptions = {
    formInputClass: "form-control cron-editor-input",
    formSelectClass: "form-control cron-editor-select",
    formRadioClass: "cron-editor-radio",
    formCheckboxClass: "cron-editor-checkbox",

    defaultTime: "10:00:00",
    use24HourTime: true,

    hideMinutesTab: true,
    hideHourlyTab: true,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: false,
    hideSeconds: true,

    removeSeconds: false,
    removeYears: false,
  };

  showCover = false;

  private activatedRouteSubscription: Subscription;

  form = new FormGroup({
    cronExpressionFC: new FormControl({
      value: this.cronExpression,
      disabled: this.isCronDisabled,
    })
  });

  activeOptions: Option[] = [
    {
      value: "true",
      label: $localize`:@@HYT_statistics_active:ACTIVE`,
      checked: true,
    },
    { value: "false", label: $localize`:@@HYT_statistics_disabled:DISABLED` },
    // { value: '', label: $localize`:@@HYT_start_statistic:START STATISTIC` }
  ];

  constructor(
    injector: Injector,
    private algorithmsService: AlgorithmsService,
    private hProjectAlgorithmsService: HprojectalgorithmsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(injector,cdr);
    this.formTemplateId = "container-statistic-form";
    this.hideDelete = true;
    this.longDefinition = this.entitiesService.statistic.longDefinition;
    this.formTitle = this.entitiesService.statistic.formTitle;
    this.icon = this.entitiesService.statistic.icon;
    this.activatedRouteSubscription =
      this.activatedRoute.parent.params.subscribe((routeParams) => {
        if (routeParams.projectId) {
          this.currentProject = {
            id: routeParams.projectId,
            entityVersion: null,
          }; // read id of project
          this.loadData();
        }
      });
  }

  ngOnInit() {
    this.algorithmsService.findAllAlgorithm().subscribe((res) => {
      this.algorithmList = res;
      this.algorithmOptions = this.algorithmList.map((algorithm) => ({
        value: algorithm,
        label: algorithm.name,
      }));
    });
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  algorithmChanged(event): void {
    this.selectedAlgorithm = event.value;
    this.buildConfig();
    this.statisticInputDefinition.setConfigDefinition(
      JSON.stringify(this.config)
    );
  }

  private buildConfig(): void {
    if (
      this.entity.id > 0 &&
      this.selectedAlgorithm.id === this.entity.algorithm.id
    ) {
      // edit mode and selected algorithm was bound yet
      this.config = JSON.parse(this.entity.config);
    } else {
      this.config = { input: [], output: [] };
    }
  }

  cancel() {
    this.resetErrors();
    this.resetForm();
    this.editMode = false;
    this.showCancel = false;
  }

  delete(successCallback, errorCallback) {
    this.hProjectAlgorithmsService
      .deleteHProjectAlgorithm(this.entity.id)
      .subscribe(
        (res) => {
          this.resetErrors();
          this.resetForm();
          this.updateSummaryList();
          this.showCancel = false;
          if (successCallback) {
            successCallback();
          }
        },
        (err) => {
          if (errorCallback) {
            errorCallback();
          }
        }
      );
  }

  edit(hProjectAlgorithm?: HProjectAlgorithm, readyCallback?) {
    const proceedWithEdit = () => {
      this.editMode = true;
      this.showCancel = true;
      super.edit(hProjectAlgorithm, () => {
        delete this.entity["name"]; // this property is set on cloning, but HProjectAlgorithm does not have it
        this.statisticInputDefinition.setConfigDefinition(this.entity.config);
        if (
          hProjectAlgorithm &&
          hProjectAlgorithm.algorithm &&
          this.algorithmOptions.some(
            (x) => x.value.id === this.entity.algorithm.id
          )
        ) {
          this.selectedAlgorithm = this.algorithmOptions.find(
            (x) => x.value.id === this.entity.algorithm.id
          ).value;
          this.config = JSON.parse(hProjectAlgorithm.config);
          this.cronExpression = hProjectAlgorithm.cronExpression;
        }
        this.form.get("algorithm-name").setValue(this.selectedAlgorithm);
        this.form.get("active").setValue("" + hProjectAlgorithm.active);
        if (readyCallback) {
          readyCallback();
        }
      });
    };
    const canDeactivate = this.canDeactivate();
    if (typeof canDeactivate === "boolean" && canDeactivate === true) {
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
      if (this.divHeight > 353) {
        /* BIG */
        return "loading-logo display-logo big-bg";
      }
      if (this.divHeight >= 293 && this.divHeight <= 352) {
        /* MEDIUM */
        return "loading-logo display-logo medium-bg";
      }
      if (this.divHeight >= 233 && this.divHeight <= 292) {
        /* SMALL */
        return "loading-logo display-logo small-bg";
      }
      if (this.divHeight >= 182 && this.divHeight <= 232) {
        /* X-SMALL */
        return "loading-logo display-logo x-small-bg";
      }
      if (this.divHeight < 182) {
        /* X-SMALL */
        return "";
      }
    } else {
      return "";
    }
  }

  isDirty() {
    return (
      this.editMode &&
      (super.isDirty() || this.statisticInputDefinition.isDirty())
    );
  }

  isValid(): boolean {
    return this.editMode && this.statisticInputDefinition
      ? super.isValid() && !this.statisticInputDefinition.isInvalid()
      : false;
  }

  loadData() {
    this.updateSummaryList();
    this.entityEvent.emit({
      event: "treeview:focus",
      id: this.currentProject.id,
      type: "statistics",
    });
  }

  loadEmpty() {
    this.form.reset();
    this.statisticInputDefinition.resetRuleDefinition();
    this.entity = { ...this.entitiesService.statistic.emptyModel };
    this.config = JSON.parse(this.entity.config);
    this.selectedAlgorithm = this.entity.algorithm;
    this.edit(this.entity);
  }

  changeEventActive(event) {
    this.form.get("active").setValue(event);
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
    // set output configuration (it does not ever change from algorithm base configuration)
    const baseConfig: AlgorithmConfig = JSON.parse(
      this.selectedAlgorithm.baseConfig
    );
    this.config.output = baseConfig.output;

    hProjectAlgorithm.config = JSON.stringify(this.config);
    hProjectAlgorithm.cronExpression = this.cronExpression;
    hProjectAlgorithm.name = this.form.get("hprojectalgorithm-name").value;
    hProjectAlgorithm.active = this.form.get("active").value;

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
      this.hProjectAlgorithmsService
        .updateHProjectAlgorithm(hProjectAlgorithm)
        .subscribe(responseHandler, (err) => {
          this.setErrors(err);
          errorCallback && errorCallback(err);
        });
    } else {
      hProjectAlgorithm.entityVersion = 1;
      this.hProjectAlgorithmsService
        .saveHProjectAlgorithm(hProjectAlgorithm)
        .subscribe(responseHandler, (err) => {
          this.setErrors(err);
          errorCallback && errorCallback(err);
        });
    }
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException": {
          this.validationError = [
            {
              message: $localize`:@@HYT_unavailable_hprojectalgorithm_name:Unavailable statistic name`,
              field: "hprojectalgorithm-name",
              invalidValue: "",
            },
          ];
          this.form.get("hprojectalgorithm-name").setErrors({
            validateInjectedError: {
              valid: false,
            },
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case "it.acsoftware.hyperiot.base.exception.HyperIoTValidationException": {
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
    this.hProjectAlgorithmsService
      .findByHProjectId(this.currentProject.id)
      .subscribe((hProjectAlgorithms: HProjectAlgorithm[]) => {
        console.log('HPROJECTALGORITHMS', hProjectAlgorithms)
        this.summaryList = {
          title: this.formTitle,
          list: hProjectAlgorithms.map(
            (x) =>
              ({
                name: x.name,
                description: x.algorithm?.description,
                data: x,
              } as SummaryListItem)
          ),
        };
        console.log('SUMMARYLIST', this.summaryList)
      });
  }
}
