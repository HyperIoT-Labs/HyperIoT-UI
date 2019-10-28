import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HPacket, Rule, RulesService, HpacketsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { RuleDefinitionComponent } from '../../rule-definition/rule-definition.component';
import { AssetTagComponent } from '../asset-tag/asset-tag.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
// TODO: find a bettere placement for PageStatusEnum
import { PageStatusEnum } from '../../../project-wizard/model/pageStatusEnum';

@Component({
  selector: 'hyt-packet-enrichment',
  templateUrl: './packet-enrichment.component.html',
  styleUrls: ['./packet-enrichment.component.scss']
})
export class PacketEnrichmentComponent /* extends ProjectDetailEntity*/ implements OnInit {

  submitType: string = 'ADD';

  @Input() currentPacket: HPacket;

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag', { static: false }) assetTagComponent: AssetTagComponent;

  @Output() saveRule = new EventEmitter();

  @Output() updateRule = new EventEmitter();

  enrichmentForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: "AddCategoryRuleAction", ruleId: 0, categoryIds: null }), label: this.i18n('HYT_categories') },
    { value: JSON.stringify({ actionName: "AddTagRuleAction", ruleId: 0, tagIds: null }), label: this.i18n('HYT_tags') },
    { value: JSON.stringify({ actionName: "ValidateHPacketRuleAction", ruleId: 0 }), label: this.i18n('HYT_validation') }
  ]

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService,
    private i18n: I18n
  ) { }

  ngOnInit() {
    this.enrichmentForm = this.fb.group({})

    this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
      res => { }//TODO //this.enrichmentRules = res
    )
  }

  enrichmentType: string = '';

  enrichmentTypeChanged(event) {
    if (event.value)
      this.enrichmentType = JSON.parse(event.value).actionName;
  }

  postRule() {

    this.errors = [];

    this.pageStatus = PageStatusEnum.Loading;

    var jActions = [this.enrichmentForm.value['enrichmentRule']];
    var jActionStr: string = JSON.stringify(jActions);

    const project = this.currentPacket.device.project;
    let rule: Rule = {
      name: this.enrichmentForm.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.enrichmentForm.value['rule-description'],
      project: {
        id: project.id,
        entityVersion: project.entityVersion
      },
      packet: this.currentPacket,
      jsonActions: jActionStr,
      type: 'ENRICHMENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.resetForm('ADD');
        this.wizardService.addEnrichmentRule(res);
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
        this.errors = this.errorHandler.handleCreateRule(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.enrichmentForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )

    if (this.enrichmentType == 'AddTagRuleAction') {
      this.currentPacket.tagIds = this.assetTags;
      this.packetService.updateHPacket(this.currentPacket).subscribe(
        (res: HPacket) => {
        }
      )
    }
    else if (this.enrichmentType == 'AddCategoryRuleAction') {
      this.currentPacket.categoryIds = this.assetCategories;
      this.packetService.updateHPacket(this.currentPacket).subscribe(
        (res: HPacket) => {
        }
      )
    }

  }

  putRule() {
    this.errors = [];
    this.updateRule.emit();
  }

  invalid(): boolean {
    return (
      this.enrichmentForm.get('rule-name').invalid ||
      this.enrichmentForm.get('enrichmentRule').invalid ||
      this.enrichmentForm.get('rule-description').invalid ||
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    )
  }

  setForm(data: Rule, type: string) {
    this.resetForm(type);
    this.ruleDefinitionComponent.setRuleDefinition(data.ruleDefinition);
    this.enrichmentForm.get('rule-description').setValue(data.description);
    this.enrichmentForm.get('rule-name').setValue(data.name);
    this.enrichmentForm.get('enrichmentRule').setValue(JSON.parse(data.jsonActions)[0] || null);
  }

  resetForm(type: string) {
    this.submitType = type;
    this.errors = [];
    this.ruleDefinitionComponent.resetRuleDefinition();
    this.enrichmentForm.reset();
  }

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  isDeviceInserted() {
    return (this.enrichmentForm.get('enrichmentDevice')) ? this.enrichmentForm.get('enrichmentDevice').invalid : true;
  }

  //Tags

  assetTags: number[] = [];

  updateAssetTag(event) {
    this.assetTags = event;
  }

  //Category

  assetCategories: number[] = [];

  updateAssetCategory(event) {
    this.assetCategories = event;
  }

  updateHint(event: string) {
    this.wizardService.updateHint(event, 4);
  }

}
