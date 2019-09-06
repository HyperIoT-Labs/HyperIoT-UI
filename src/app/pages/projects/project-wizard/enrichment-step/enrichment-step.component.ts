import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HpacketsService, RulesService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';

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

  hPacketsforDevice: HPacket[] = [];

  currentPacket;

  errors: HYTError[] = [];

  // ruleDefinition: string = '';

  enrichmentForm: FormGroup;

  enrichmentRules: SelectOption[] = [
    { value: ' Categories', label: 'Categories' },
    { value: ' Tags', label: 'Tags' },
    { value: ' Validation', label: 'Validation' }
  ]

  ruleList: Rule[] = [];

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private rulesService: RulesService
  ) { }

  ngOnInit() {
    this.enrichmentForm = this.fb.group({});
  }

  ngOnChanges() {
    this.devicesOptions = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName });
    this.packetsOptions = [];
  }

  deviceChanged(event) {
    console.log(event.value)
    this.packetsOptions = [];
    for (let el of this.hPackets)
      if (event.value == el.device.id)
        this.packetsOptions.push({ value: el.id.toString(), label: el.name });
  }

  packetChanged(event) {
    this.currentPacket = this.hPackets.find(x => x.id == event.value);
  }

  createRule() {

    this.errors = [];

    var action = JSON.stringify({ actionName: "AddCategoryRuleAction2", ruleId: 0, categoryIds: [456], ruleType: "ENRICHMENT" });
    var actions = [action];
    var str: string = JSON.stringify(actions);

    let rule: Rule = {
      name: this.enrichmentForm.value.ruleName,
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.enrichmentForm.value['rule-description'],
      project: this.hProject,
      packet: this.currentPacket,
      jsonActions: str,
      type: 'ENRICHMENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.ruleList.push(res);
      },
      err => {

      }
    )

  }

  updateRuleDefinition(rd) {
    // this.ruleDefinition = rd;
  }

  invalid(): boolean {
    return (
      this.enrichmentForm.get('ruleName').invalid ||
      this.enrichmentForm.get('enrichmentRule').invalid ||
      this.enrichmentForm.get('rule-description').invalid ||
      this.enrichmentForm.get('enrichmentDevice').invalid ||
      this.enrichmentForm.get('enrichmentPacket').invalid ||
      this.ruleDefinitionComponent.isInvalid()
    )
  }

  isDeviceInserted() {
    return (this.enrichmentForm.get('enrichmentDevice')) ? this.enrichmentForm.get('enrichmentDevice').invalid : true;
  }

}
