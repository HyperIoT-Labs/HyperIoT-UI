import { Component, ViewChild } from '@angular/core';
import { RulesService, HPacket, Rule } from '@hyperiot/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { PacketEventComponent } from './packet-event/packet-event.component';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PacketSelectComponent } from '../packet-select/packet-select.component';


@Component({
  selector: 'hyt-events-step',
  templateUrl: './events-step.component.html',
  styleUrls: ['./events-step.component.scss']
})
export class EventsStepComponent {

  @ViewChild('eventForm', { static: false }) form: PacketEventComponent;
  @ViewChild('packetSelect', { static: false }) packetSelect: PacketSelectComponent;

  selectedRule: Rule;

  constructor(
    private rulesService: RulesService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  currentPacket: HPacket;

  eventList: Rule[] = [];

  packetChanged(event) {
    this.currentPacket = event;
  }

  saveEvent() {

    this.form.pageStatus = PageStatusEnum.Loading;

    var jActionStr: string = '';

    if (this.form.eventsForm.value['eventOutput'] == 'SendMailAction') {
      let mail = this.form.eventMailComponent.buildMail();
      let act = {
        actionName: 'events.SendMailAction',
        recipients: mail.mailRecipient,
        ccRecipients: mail.mailCC,
        subject: mail.mailObject,
        body: mail.mailBody
      }
      var jActions = [JSON.stringify(act)];
      jActionStr = JSON.stringify(jActions);
    }

    let rule: Rule = {
      name: this.form.eventsForm.value['rule-name'],
      ruleDefinition: this.form.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.form.eventsForm.value['rule-description'],
      project: this.wizardService.getHProject(),
      packet: this.currentPacket,
      jsonActions: jActionStr,
      type: 'EVENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.wizardService.addEventRule(res);
        this.form.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreateRule(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.eventsForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    );
  }

  updateEvent() {
    this.form.pageStatus = PageStatusEnum.Loading;

    var jActionStr: string = '';

    if (this.form.eventsForm.value['eventOutput'] == 'SendMailAction') {
      let mail = this.form.eventMailComponent.buildMail();
      let act = {
        actionName: 'events.SendMailAction',
        recipients: mail.mailRecipient,
        ccRecipients: mail.mailCC,
        subject: mail.mailObject,
        body: mail.mailBody
      }
      var jActions = [JSON.stringify(act)];
      jActionStr = JSON.stringify(jActions);
    }

    let rule: Rule = {
      id: this.selectedRule.id,
      entityVersion: this.selectedRule.entityVersion,
      name: this.form.eventsForm.value['rule-name'],
      ruleDefinition: this.form.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.form.eventsForm.value['rule-description'],
      jsonActions: jActionStr,
    }

    this.rulesService.updateRule(rule).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.packetSelect.autoSelect();
        this.wizardService.updateEventRule(res);
        this.form.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreateRule(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.eventsForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    );
  }

  tableUpdateRule(rule: Rule) {
    this.selectedRule = rule;
    this.packetSelect.setPacket(rule.packet);
    this.packetSelect.freezeSelection();
    this.currentPacket = rule.packet;
    this.form.setForm(rule, 'UPDATE');
  }

  tableCopyRule(rule: Rule) {
    this.packetSelect.setPacket(rule.packet);
    this.currentPacket = rule.packet;
    this.form.setForm(rule, 'ADD');
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
        this.form.resetForm('ADD');
        this.packetSelect.autoSelect();
        this.wizardService.deleteEventRule(this.selectedRule.id);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
