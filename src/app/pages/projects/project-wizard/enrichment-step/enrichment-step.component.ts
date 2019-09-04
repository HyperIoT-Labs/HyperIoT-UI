import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HpacketsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';

@Component({
  selector: 'hyt-enrichment-step',
  templateUrl: './enrichment-step.component.html',
  styleUrls: ['./enrichment-step.component.scss']
})
export class EnrichmentStepComponent implements OnInit, OnChanges {

  @Input() hProject: HProject;

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  hPacketsforDevice: HPacket[] = [];

  currentPacket;

  ruleDefinition: string = '';

  enrichmentForm: FormGroup;

  enrichmentRules: SelectOption[] = [
    { value: ' Categories', label: 'Categories' },
    { value: ' Tags', label: 'Tags' },
    { value: ' Validation', label: 'Validation' }
  ]

  enrichmentList = [];

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {
    this.enrichmentForm = this.fb.group({});
  }

  ngOnChanges() {
    // this.hDevices = [];
    // for (let el of this.hDevices)
    //   this.hDevices.push({ value: el.id.toString(), label: el.deviceName })
  }

  createRule() {
    let rule: Rule = {
      name: this.enrichmentForm.value.ruleName,
      ruleDefinition: '',
      project: this.hProject,
      packet: this.currentPacket,
      actions: null,
      type: 'ENRICHMENT',
      entityVersion: 1
    }
  }

  updateRuleDefinition(rd) {
    this.ruleDefinition = rd;
  }

  invalid(): boolean {
    return (
      this.enrichmentForm.get('ruleName').invalid ||
      this.enrichmentForm.get('enrichmentRule').invalid ||
      this.enrichmentForm.get('deviceEnrichment').invalid ||
      this.enrichmentForm.get('packetEnrichment').invalid
    )
  }

  dati() {
    this.hPacketService.findHPacket(417).subscribe(
      res => {
        console.log(res);
        this.currentPacket = res;
      }
    )
  }

}
