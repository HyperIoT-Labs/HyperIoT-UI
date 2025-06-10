import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Option, RuleDefinitionComponent, SelectOption } from 'components';
import { HPacket, HpacketsService, HProject, Rule, RulesService } from 'core';
import { Observable, Subscription, of } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import { EnrichmentsService } from 'src/app/services/enrichments/enrichments.service';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
// TODO: find a bettere placement for PageStatusEnum
import { LoadingStatusEnum, ProjectFormEntity } from '../project-form-entity';
import { AssetCategoryComponent } from './asset-category/asset-category.component';
import { AssetTagComponent } from './asset-tag/asset-tag.component';
import { EnrichmentType } from './enrichment-type.enum';
import { FourierTransformComponent } from './fourier-transform/fourier-transform.component';
import { FormControl } from '@angular/forms';
import { VirtualSensorComponent } from './virtual-sensor/virtual-sensor.component';

@Component({
  selector: 'hyt-packet-enrichment-form',
  templateUrl: './packet-enrichment-form.component.html',
  styleUrls: ['./packet-enrichment-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PacketEnrichmentFormComponent extends ProjectFormEntity implements OnInit, OnDestroy {

  entityFormMap = {
    'rule-name': {
      field: 'name'
    },
    'rule-description': {
      field: 'description'
    }
  };

  @ViewChild('ruleDef')
  ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag')
  assetTagComponent: AssetTagComponent;

  @ViewChild('assetCategory')
  assetCategoryComponent: AssetCategoryComponent;

  @ViewChild('fourierTransform')
  fourierTransformComponent: FourierTransformComponent;

  @ViewChild('virtualSensor')
  virtualSensorComponent: VirtualSensorComponent;

  enrichmentTypes = EnrichmentType;

  packet: HPacket;

  entity = {} as Rule;

  project: HProject = {} as HProject;

  enrichmentRules: SelectOption[] = [
    { value: EnrichmentType.ADD_CATEGORY_ENRICHMENT, label: $localize`:@@HYT_categories:Categories` },
    { value: EnrichmentType.ADD_TAG_ENRICHMENT, label: $localize`:@@HYT_tags:Tags` },
    { value: EnrichmentType.VALIDATION_ENRICHMENT, label: $localize`:@@HYT_validation:Validation` },
    { value: EnrichmentType.FOURIER_TRANSFORM_ENRICHMENT, label: $localize`:@@HYT_fourier_transform:FourierTransform` },
    { value: EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT, label: $localize`:@@HYT_virtual_sensor:VirtualSensor` }
  ];

  activeOptions: Option[] = [
    { value: "true", label: $localize`:@@HYT_enrichment_active:ACTIVE`, checked: true },
    { value: "false", label: $localize`:@@HYT_enrichment_disabled:DISABLED` }
    // { value: '', label: $localize`:@@HYT_start_statistic:START STATISTIC` }
  ];

  selectedEnrichmentType: EnrichmentType | undefined;

  ruleConfig = {};

  assetTags: number[] = [];
  assetCategories: number[] = [];

  showCover = false;

  private activatedRouteSubscription: Subscription;

  private packetId: number;

  allPackets: HPacket[];

  constructor(
    injector: Injector,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private enrichmentService: EnrichmentsService
  ) {
    super(injector, cdr);
    this.formTemplateId = 'container-enrichment-form';
    this.longDefinition = this.entitiesService.enrichment.longDefinition;
    this.formTitle = this.entitiesService.enrichment.formTitle;
    this.icon = this.entitiesService.enrichment.icon;
    this.hideDelete = true; // hide 'Delete' button
  }

  ngOnInit() {
    this.form.addControl('ruleDefinition', new FormControl(''));
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.packetId = +(this.activatedRoute.snapshot.params.packetId);
      if (this.packetId) {
        this.loadData().subscribe(res => { });
      }
    });

    this.activatedRoute.url.pipe(
      filter((val) => val.length === 2 && val[0].path === 'packet-enrichments'),
      switchMap((val) => {
        return this.packetService.findHPacket(+val[1].path)
      })
    ).subscribe((el) => {
      this.enrichmentService.emitDeviceName(el.device.deviceName);
      this.enrichmentService.emitPacket(this.packetId);
    })
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  save(successCallback, errorCallback) {
    this.saveRule(successCallback, errorCallback);
  }

  edit(rule?: Rule, readyCallback?) {
    const proceedWithEdit = () => {
      this.showCancel = true;
      this.editMode = true;
      super.edit(rule, () => {
        const type = JSON.parse(this.entity.jsonActions)[0] || null;
        const typeJSON = JSON.parse(type) ? JSON.parse(type) : null;
        this.selectedEnrichmentType = typeJSON ? typeJSON.actionName : null;

        switch (this.selectedEnrichmentType) {
          case EnrichmentType.ADD_CATEGORY_ENRICHMENT:
            if (this.assetCategoryComponent) {
              this.assetCategoryComponent.selectedCategories = JSON.parse(type) ? JSON.parse(type).categoryIds : null;
              this.assetCategoryComponent.getAssetCategories();
            } else {
              this.assetCategories = JSON.parse(type) ? JSON.parse(type).categoryIds : null;
            }
            break;

          case EnrichmentType.ADD_TAG_ENRICHMENT:
            if (this.assetTagComponent) {
              this.assetTagComponent.selectedTags = JSON.parse(type) ? JSON.parse(type).tagIds : null;
              this.assetTagComponent.getAssetTags();
            } else {
              this.assetTags = JSON.parse(type) ? JSON.parse(type).tagIds : null;
            }
            break;

          case EnrichmentType.FOURIER_TRANSFORM_ENRICHMENT:
            this.ruleConfig = JSON.parse(type);
            break;

          case EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT:
            console.log('VIRTUAL_SENSOR_ENRICHMENT', 'x');

            this.ruleConfig = JSON.parse(type);
            break;
        }

        this.form.get('rule-type').setValue(this.selectedEnrichmentType);
        this.form.get('active').setValue(typeJSON.active);
        this.form.get('ruleDefinition').setValue({
          ruleDefinition: this.entity.ruleDefinition,
          rulePrettyDefinition: this.entity.rulePrettyDefinition,
        });
        this.cdr.detectChanges();
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

  cancel() {
    this.resetErrors();
    this.resetForm();
    this.editMode = false;
    this.showCancel = false;
  }

  delete(successCallback, errorCallback) {
    this.rulesService.deleteRule(this.entity.id).subscribe((res) => {
      this.resetErrors();
      this.resetForm();
      this.showCancel = false;
      this.updateSummaryList();
      if (successCallback) { successCallback(); }
    }, (err) => {
      if (errorCallback) { errorCallback(); }
    });
  }

  loadData(packetId?: number) {
    if (packetId) { this.packetId = packetId; }
    return this.packetService.findHPacket(this.packetId).pipe(map((p => {
      this.project = p.device.project;
      // load allPackets for ruleDefinition
      this.packetService.findAllHPacketByProjectIdAndType(this.project.id, 'INPUT,IO').subscribe(
        res => this.allPackets = res,
      );
      this.packet = p;
      this.updateSummaryList();
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-enrichments'
      });
      return p;
    })));
  }

  buildJActions(): string {
    let jac = '';
    switch (this.form.get('rule-type').value) {
      case EnrichmentType.ADD_CATEGORY_ENRICHMENT:
        jac = JSON.stringify({
          actionName: EnrichmentType.ADD_CATEGORY_ENRICHMENT,
          categoryIds: this.assetCategoryComponent.selectedCategories,
          active: this.form.get("active").value
        });
        break;

      case EnrichmentType.ADD_TAG_ENRICHMENT:
        jac = JSON.stringify({
           actionName: EnrichmentType.ADD_TAG_ENRICHMENT, 
           tagIds: this.assetTagComponent.selectedTags, 
           active: this.form.get("active").value 
          });
        break;

      case EnrichmentType.VALIDATION_ENRICHMENT:
        jac = JSON.stringify({ 
          actionName: EnrichmentType.VALIDATION_ENRICHMENT, 
          active: this.form.get("active").value 
        });
        break;

      case EnrichmentType.FOURIER_TRANSFORM_ENRICHMENT:
        this.ruleConfig['active'] = this.form.get("active").value;
        jac = JSON.stringify(this.ruleConfig);
        break;

      case EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT:
        console.log('VIRTUAL_SENSOR_ENRICHMENT');

        this.ruleConfig['active'] = this.form.get("active").value;
        jac = JSON.stringify(this.ruleConfig);
        break;
    }
    return JSON.stringify([jac]);
  }

  saveRule(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const rule = this.entity;
    Object.assign(rule, {
      name: this.form.get('rule-name').value,
      ruleDefinition: this.form.get('ruleDefinition').value.ruleDefinition,
      rulePrettyDefinition: this.form.get('ruleDefinition').value.rulePrettyDefinition,
      description: this.form.get('rule-description').value,
      project: {
        id: this.project.id
      },
      packet: this.packet,
      jsonActions: this.buildJActions(),
      type: 'ENRICHMENT'
    });

    delete rule.actions;
    delete rule.parent;
    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.updateSummaryList();
      this.showCancel = false;
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };

    if (rule.id) {
      // update existing rule
      this.rulesService.updateRule(rule).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
        this.loadingStatus = LoadingStatusEnum.Error;
      });
    } else {
      // save new rule
      rule.entityVersion = 1;
      this.rulesService.saveRule(rule).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
        this.loadingStatus = LoadingStatusEnum.Error;
      });
    }
  }

  loadEmpty() {
    this.form.reset();
    this.selectedEnrichmentType = null;
    this.assetTags = [];
    this.assetCategories = [];
    this.cdr.detectChanges();
    this.entity = { ...this.entitiesService.enrichment.emptyModel };
    this.edit();
  }

  updateSummaryList() {
    this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
      this.summaryList = {
        title: this.formTitle,
        list: rules.filter((i) => {
          if (i.type === Rule.TypeEnum.ENRICHMENT) {
            return i;
          }
        }).map((r) => ({ name: r.name, description: r.description, data: r }) as SummaryListItem)
      };
    });
  }

  enrichmentTypeChanged(event) {
    if (event.value) {
      this.selectedEnrichmentType = event.value;
    }
  }

  changeEventActive(event) {
    if (event) {
      this.form.get('active').setValue(event);
    }
  }

  categoryDirty() {
    return this.assetTagComponent ? this.assetTagComponent.isDirty() : false;
  }

  tagDirty() {
    return this.assetCategoryComponent ? this.assetCategoryComponent.isDirty() : false;
  }

  fftDirty() {
    return this.fourierTransformComponent ? this.fourierTransformComponent.isDirty() : false;
  }

  virtualSensorDirty() {
    return this.virtualSensorComponent?.isDirty() || false;
  }

  isValid() {
    return super.isValid() && !this.invalidRules()
      && (
        this.fourierTransformComponent?.isValid() ||
        this.virtualSensorComponent?.isValid()
      );
  }

  isDirty() {
    return this.editMode &&
      (
        super.isDirty() ||
        this.ruleDefinitionComponent?.isDirty() ||
        this.categoryDirty() ||
        this.tagDirty() ||
        this.fftDirty() ||
        this.virtualSensorDirty()
      );
  }

  private invalidRules(): boolean {
    return this.ruleDefinitionComponent ? this.ruleDefinitionComponent.isInvalid() : false;
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ "message": $localize`:@@HYT_unavailable_rule_name:Unavailable rule name`, "field": 'rule-name', "invalidValue": '' }];
          this.form.get('rule-name').setErrors({
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

