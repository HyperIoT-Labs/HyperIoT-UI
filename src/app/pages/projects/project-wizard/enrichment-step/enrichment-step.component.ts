import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { HDevice, HPacket, Rule, RulesService, HProject } from '@hyperiot/core';

@Component({
  selector: 'hyt-enrichment-step',
  templateUrl: './enrichment-step.component.html',
  styleUrls: ['./enrichment-step.component.scss']
})
export class EnrichmentStepComponent implements OnChanges {

  constructor(
    private rulesService: RulesService
  ) { }

  @Input() hDevices: HDevice[] = [];

  currentPacket: HPacket;

  ruleList: Rule[] = [];

  @Input() hProject: HProject;

  @Input() hPackets: HPacket[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  @Output() rulesOutput = new EventEmitter<Rule[]>();

  ngOnChanges() {
    this.hDevices = [...this.hDevices];
    this.hPackets = [...this.hPackets];
  }

  packetChanged(event) {
    this.currentPacket = event;
  }

  packetsOutputChanged(event) {
    this.hPacketsOutput.emit(event);
  }

  rulesChanged(event) {
    this.ruleList = event;
    this.rulesOutput.emit(event);
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

}
