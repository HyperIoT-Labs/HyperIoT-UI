import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from '@hyperiot/components';
import { HPacket, HpacketsService, HProject, Rule, RulesService } from '@hyperiot/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Observable, Subscription } from 'rxjs';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
// TODO: find a bettere placement for PageStatusEnum
import { LoadingStatusEnum, ProjectFormEntity } from '../project-form-entity';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { AssetCategoryComponent } from './asset-category/asset-category.component';
import { AssetTagComponent } from './asset-tag/asset-tag.component';
import { FourierTransformComponent } from './fourier-transform/fourier-transform.component';

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

  @ViewChild('ruleDef', { static: false })
  ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag', { static: false })
  assetTagComponent: AssetTagComponent;

  @ViewChild('assetCategory', { static: false })
  assetCategoryComponent: AssetCategoryComponent;

  @ViewChild('fourierTransform', { static: false})
  fourierTransformComponent: FourierTransformComponent;

  packet: HPacket;

  entity = {} as Rule;

  form: FormGroup;

  project: HProject = {} as HProject;

  enrichmentRules: SelectOption[] = [
    { value: 'AddCategoryRuleAction', label: 'Categories' }, // TODO @I18N@
    { value: 'AddTagRuleAction', label: 'Tags' }, // TODO @I18N@
    { value: 'ValidateHPacketRuleAction', label: 'Validation' }, // TODO @I18N@
    { value: 'FourierTransformRuleAction', label: 'FourierTransform' } // TODO @I18N@
  ];

  enrichmentType = '';

  ruleConfig = {};

  assetTags: number[] = [];
  assetCategories: number[] = [];

  showCover = false;

  private activatedRouteSubscription: Subscription;

  private packetId: number;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = this.entitiesService.enrichment.longDefinition;
    this.formTitle = this.entitiesService.enrichment.formTitle;
    this.icon = this.entitiesService.enrichment.icon;
    this.hideDelete = true; // hide 'Delete' button
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      if (this.packetId) {
        this.loadData();
      }
    });
  }

  ngOnInit() { }

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
        this.ruleDefinitionComponent.setRuleDefinition(this.entity.ruleDefinition);
        this.enrichmentType = JSON.parse(type) ? JSON.parse(type).actionName : null;
        if (this.enrichmentType === 'AddCategoryRuleAction') {
          if (this.assetCategoryComponent) {
            this.assetCategoryComponent.selectedCategories = JSON.parse(type) ? JSON.parse(type).categoryIds : null;
            this.assetCategoryComponent.getAssetCategories();
          } else {
            this.assetCategories = JSON.parse(type) ? JSON.parse(type).categoryIds : null;
          }
        } else if (this.enrichmentType === 'AddTagRuleAction') {
          if (this.assetTagComponent) {
            this.assetTagComponent.selectedTags = JSON.parse(type) ? JSON.parse(type).tagIds : null;
            this.assetTagComponent.getAssetTags();
          } else {
            this.assetTags = JSON.parse(type) ? JSON.parse(type).tagIds : null;
          }
        } else if (this.enrichmentType === 'FourierTransformRuleAction') {
          this.ruleConfig = JSON.parse(type);
        }
        this.form.get('rule-type').setValue(this.enrichmentType);
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
    this.packetService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.project = p.device.project;
      this.packet = p;
      this.updateSummaryList();
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-enrichments'
      });
    });
  }

  buildJActions(): string {
    let jac = '';
    switch (this.form.get('rule-type').value) {
      case 'AddCategoryRuleAction':
        jac = JSON.stringify({ actionName: 'AddCategoryRuleAction', categoryIds: this.assetCategoryComponent.selectedCategories });
        break;
      case 'AddTagRuleAction':
        jac = JSON.stringify({ actionName: 'AddTagRuleAction', tagIds: this.assetTagComponent.selectedTags });
        break;
      case 'ValidateHPacketRuleAction':
        jac = JSON.stringify({ actionName: 'ValidateHPacketRuleAction' });
        break;
      case 'FourierTransformRuleAction':
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
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
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
    this.enrichmentType = null;
    this.assetTags = [];
    this.assetCategories = [];
    this.ruleDefinitionComponent.resetRuleDefinition();
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
      this.enrichmentType = event.value;
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
  isValid() {
    return super.isValid() && !this.invalidRules();
  }
  isDirty() {
    return this.editMode &&
      (
        super.isDirty() ||
        this.ruleDefinitionComponent.isDirty() ||
        this.categoryDirty() ||
        this.tagDirty() ||
        this.fftDirty()
      );
  }

  private invalidRules(): boolean {
    return (
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    );
  }

  setErrors(err) {

    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ "message": this.i18n('HYT_unavaiable_rule_name'), "field": 'rule-name', "invalidValue": '' }];
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
