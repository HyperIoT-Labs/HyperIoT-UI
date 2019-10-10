import { Component } from '@angular/core';
import { HPacket, Rule, RulesService } from '@hyperiot/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-enrichment-step',
  templateUrl: './enrichment-step.component.html',
  styleUrls: ['./enrichment-step.component.scss']
})
export class EnrichmentStepComponent {

  selectedRule: Rule;

  constructor(
    private rulesService: RulesService,
    private wizardService: ProjectWizardService
  ) { }

  currentPacket: HPacket;

  packetChanged(event) {
    this.currentPacket = event;
  }

  tableUpdateRule(rule: Rule) {//TODO
    // this.selectedRule = rule;
    // this.form.setForm(rule, 'UPDATE');
  }

  tableCopyRule(rule: Rule) {//TODO
    // this.form.setForm(rule, 'ADD');
  }

  //delete logic

  deleteModal: boolean = false;

  deleteError: string = null;

  showDeleteModal(rule: Rule) {
    this.deleteError = null;
    this.selectedRule = rule;
    this.deleteModal = true;
  }

  hideDeleteModal() {
    this.deleteModal = false;
    this.selectedRule = null;
  }

  deleteRule() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.selectedRule.id).subscribe(
      res => {
        this.wizardService.deleteEnrichmentRule(this.selectedRule.id);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
