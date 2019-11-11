import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, Injector } from '@angular/core';
import { HPacket, Rule, RulesService, HpacketsService, HProject } from '@hyperiot/core';
import { FormGroup } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { AssetTagComponent } from './asset-tag/asset-tag.component';
// TODO: find a bettere placement for PageStatusEnum
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-packet-enrichment-form',
  templateUrl: './packet-enrichment-form.component.html',
  styleUrls: ['./packet-enrichment-form.component.scss']
})
export class PacketEnrichmentFormComponent extends ProjectFormEntity implements OnInit, OnDestroy {

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;
  @ViewChild('assetTag', { static: false }) assetTagComponent: AssetTagComponent;

  packet: HPacket;

  entity = {} as Rule;
  formTitle = 'Packet Enrichments';

  form: FormGroup;

  packetList: HPacket[] = [];
  project: HProject = {} as HProject;

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: 'AddCategoryRuleAction', ruleId: 0, categoryIds: null }), label: 'Categories' }, // TODO i18n
    { value: JSON.stringify({ actionName: 'AddTagRuleAction', ruleId: 0, tagIds: null }), label: 'Tags' }, // TODO i18n
    { value: JSON.stringify({ actionName: 'ValidateHPacketRuleAction', ruleId: 0 }), label: 'Validation' } // TODO i18n
  ];

  enrichmentType = '';

  assetTags: number[] = [];
  assetCategories: number[] = [];

  showCover = false;

  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;

  private packetId: number;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = this.i18n('HYT_enrichment_long_definition');
    this.hideDelete = true; // hide 'Delete' button
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        this.loadData();
      }
    });
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.editMode = false;
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      if (this.packetId) {
        this.loadData();
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  save(successCallback, errorCallback) {
    this.saveRule(successCallback, errorCallback);
  }
  edit(rule: Rule, readyCallback?) {
    const proceedWithEdit = () => {
      this.showCancel = true;
      this.editMode = true;
      this.setForm(rule);
      if (readyCallback) {
        readyCallback();
      }
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
      this.packetService.findAllHPacketByProjectId(this.project.id)
        .subscribe((pl: HPacket[]) => {
          this.packetList = pl;
          this.packet = p;
          // update rules summary list (on the right side)
          this.updateSummaryList();
        });
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-enrichments'
      });
    });
  }

  saveRule(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const jActions = [this.form.get('enrichmentRule').value];
    const jActionStr = JSON.stringify(jActions);
    const rule = this.entity;

    Object.assign(rule, {
      name: this.form.get('rule-name').value,
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.form.get('rule-description').value,
      project: {
        id: this.project.id
      },
      packet: this.packet,
      jsonActions: jActionStr,
      type: 'ENRICHMENT',
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

  onAddButtonClick() {
    this.cleanForm();
    this.edit({ jsonActions: '[]' } as Rule);
  }

  updateSummaryList() {
    this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
      this.summaryList = {
        title: 'Enrichments Data',
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
      this.enrichmentType = JSON.parse(event.value).actionName;
    }
  }

  isValid() {
    return super.isValid() && !this.invalidRules();
  }
  isDirty() {
    return this.editMode && (super.isDirty() || this.ruleDefinitionComponent.isDirty());
  }

  private invalidRules(): boolean {
    return (
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    );
  }

  // TODO: code below is still to be verified / refactored


  setForm(data: Rule) {
    if (data) {
      this.entity = data;
      let type = JSON.parse(data.jsonActions)[0] || null;
      this.ruleDefinitionComponent.setRuleDefinition(data.ruleDefinition);
      this.form.get('rule-description').setValue(data.description);
      this.form.get('rule-name').setValue(data.name);
      this.form.get('enrichmentRule').setValue(type);
      type = JSON.parse(type);
      this.enrichmentType = type ? type.actionName : null;
    }
    this.resetForm();
  }

  resetForm() {
    super.resetForm();
    this.ruleDefinitionComponent.originalValueUpdate();
    //this.errors = [];
    // this.ruleDefinitionComponent.resetRuleDefinition();
    // this.form.reset();
  }

  cleanForm() {
    super.cleanForm();
    this.ruleDefinitionComponent.resetRuleDefinition();
  }

  postRule() {

    if (this.enrichmentType === 'AddTagRuleAction') {
      this.packet.tagIds = this.assetTags;
      this.packetService.updateHPacket(this.packet).subscribe(
        (res: HPacket) => {
        }
      );
    } else if (this.enrichmentType === 'AddCategoryRuleAction') {
      this.packet.categoryIds = this.assetCategories;
      this.packetService.updateHPacket(this.packet).subscribe(
        (res: HPacket) => {
        }
      );
    }

  }

  // Tags
  updateAssetTag(event) {
    this.assetTags = event;
  }

  // Category
  updateAssetCategory(event) {
    this.assetCategories = event;
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
