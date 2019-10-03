import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HProject, HPacket, Rule, RulesService, HpacketsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { RuleDefinitionComponent } from '../../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PageStatusEnum } from '../../model/pageStatusEnum';
import { AssetTagComponent } from '../../asset-tag/asset-tag.component';

@Component({
  selector: 'hyt-packet-enrichment',
  templateUrl: './packet-enrichment.component.html',
  styleUrls: ['./packet-enrichment.component.scss']
})
export class PacketEnrichmentComponent implements OnInit {

  @Input() hProject: HProject;

  @Input() currentPacket: HPacket;

  @Input() hPackets: HPacket[] = [];

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag', { static: false }) assetTagComponent: AssetTagComponent;

  enrichmentForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  errors: HYTError[] = [];

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: "AddCategoryRuleAction", ruleId: 0, categoryIds: null }), label: 'Categories' },
    { value: JSON.stringify({ actionName: "AddTagRuleAction", ruleId: 0, tagIds: null }), label: 'Tags' },
    { value: JSON.stringify({ actionName: "ValidateHPacketRuleAction", ruleId: 0 }), label: 'Validation' }
  ]

  ruleList: Rule[] = [];

  @Output() rulesOutput = new EventEmitter<Rule[]>();

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
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

  createRule() {

    this.pageStatus = PageStatusEnum.Loading;

    this.errors = [];

    var jActions = [this.enrichmentForm.value['enrichmentRule']];
    var jActionStr: string = JSON.stringify(jActions);

    let rule: Rule = {
      name: this.enrichmentForm.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.enrichmentForm.value['rule-description'],
      project: this.hProject,
      packet: this.currentPacket,
      jsonActions: jActionStr,
      type: 'ENRICHMENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.ruleList.push(res);
        this.rulesOutput.emit(this.ruleList);
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
          this.hPackets.find(x => x.id == this.currentPacket.id).tagIds = res.tagIds;
          this.hPacketsOutput.emit(this.hPackets);
        }
      )
    }
    else if (this.enrichmentType == 'AddCategoryRuleAction') {
      this.currentPacket.categoryIds = this.assetCategories;
      this.packetService.updateHPacket(this.currentPacket).subscribe(
        (res: HPacket) => {
          this.hPackets.find(x => x.id == this.currentPacket.id).categoryIds = res.categoryIds;
          this.hPacketsOutput.emit(this.hPackets);
        }
      )
    }

  }

  invalid(): boolean {
    return (
      this.enrichmentForm.get('rule-name').invalid ||
      this.enrichmentForm.get('enrichmentRule').invalid ||
      this.enrichmentForm.get('rule-description').invalid ||
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    )
  }

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
}
