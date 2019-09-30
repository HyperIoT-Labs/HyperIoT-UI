import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, RulesService, AssetstagsService, AssetTag, HpacketsService } from '@hyperiot/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SelectOption, TreeNodeCategory } from '@hyperiot/components';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material';
import { startWith, map } from 'rxjs/operators';
import { AssetTagComponent } from '../asset-tag/asset-tag.component';

@Component({
  selector: 'hyt-enrichment-step',
  templateUrl: './enrichment-step.component.html',
  styleUrls: ['./enrichment-step.component.scss']
})
export class EnrichmentStepComponent implements OnInit, OnChanges {

  @Input() hProject: HProject;

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  devicesOptions: SelectOption[] = [];

  packetsOptions: SelectOption[] = [];

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag', { static: false }) assetTagComponent: AssetTagComponent;

  hPacketsforDevice: HPacket[] = [];

  currentDevice;
  currentPacket;

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

  ngOnChanges() {
    this.refreshDeviceList();
    this.refreshPacketList();
  }

  refreshDeviceList() {
    this.devicesOptions = [];
    if (this.enrichmentForm)
      this.enrichmentForm.patchValue({
        enrichmentDevice: null
      });
    this.currentDevice = null;
    this.hDevices.forEach(x => this.devicesOptions.push({ value: x.id.toString(), label: x.deviceName }));
  }

  refreshPacketList() {
    this.packetsOptions = [];
    if (this.enrichmentForm)
      this.enrichmentForm.patchValue({
        enrichmentPacket: null
      });
    this.currentPacket = null;
    if (this.currentDevice)
      for (let el of this.hPackets)
        if (this.currentDevice.id == el.device.id)
          this.packetsOptions.push({ value: el.id.toString(), label: el.name });
  }

  deviceChanged(event) {
    this.currentDevice = this.hDevices.find(x => x.id == event.value);
    this.refreshPacketList();
  }

  packetChanged(event) {
    this.currentPacket = this.hPackets.find(x => x.id == event.value);
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
      this.enrichmentForm.get('enrichmentDevice').invalid ||
      this.enrichmentForm.get('enrichmentPacket').invalid ||
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  isDeviceInserted() {
    return (this.enrichmentForm.get('enrichmentDevice')) ? this.enrichmentForm.get('enrichmentDevice').invalid : true;
  }

  //delete logic

  deleteId: number = -1;

  deleteError: string = null;

  showDeleteModal(id: number) {
    this.deleteError = null;
    this.deleteId = id;
  }

  hideDeleteModal() {
    this.deleteId = -1;
  }

  deleteRule() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.ruleList.length; i++) {
          if (this.ruleList[i].id == this.deleteId) {
            this.ruleList.splice(i, 1);
          }
        }
        this.rulesOutput.emit(this.ruleList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
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
