import { Component, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { RulesService, HPacket, Rule } from '@hyperiot/core';
import { PacketEventComponent } from './packet-event/packet-event.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';


@Component({
  selector: 'hyt-events-step',
  templateUrl: './events-step.component.html',
  styleUrls: ['./events-step.component.scss']
})
export class EventsStepComponent {

  selectedRule: Rule;

  constructor(
    private rulesService: RulesService,
    private wizardService: ProjectWizardService
  ) { }

  currentPacket: HPacket;

  eventList: Rule[] = [];

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

  deleteEvent() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.selectedRule.id).subscribe(
      res => {
        this.wizardService.deleteEventRule(this.selectedRule.id);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
