import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RulesService, HPacket, Rule } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { RuleDefinitionComponent } from '../../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { PageStatusEnum } from '../../model/pageStatusEnum';
import { EventMailComponent } from '../event-mail/event-mail.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-packet-event',
  templateUrl: './packet-event.component.html',
  styleUrls: ['./packet-event.component.scss']
})
export class PacketEventComponent implements OnInit {

  @Input() currentPacket: HPacket;

  @ViewChild('eventDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;
  @ViewChild('eventMail', { static: false }) EventMailComponent: EventMailComponent;

  @Output() eventsOutput = new EventEmitter<Rule[]>();

  eventsForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;


  outputOptions: Option[] = [
    { value: 'SendMailAction', label: 'SEND MAIL', checked: true }
    // { value: '', label: 'START STATISTIC' }
  ]

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.eventsForm = this.fb.group({});
    this.rulesService.findAllRuleActions('EVENT').subscribe(
      res => { }//TODO //this.outputOptions = res
    )
  }

  createEvent() {

    this.pageStatus = PageStatusEnum.Loading;

    this.errors = [];

    var jActionStr: string = '';

    if (this.eventsForm.value['eventOutput'] == 'SendMailAction') {
      let mail = this.EventMailComponent.buildMail();
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
      name: this.eventsForm.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.eventsForm.value['rule-description'],
      project: this.wizardService.getHProject(),
      packet: this.currentPacket,
      jsonActions: jActionStr,
      type: 'EVENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.wizardService.addEventRule(rule);
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
        this.errors = this.errorHandler.handleCreateRule(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.eventsForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )

  }

  invalid(): boolean {
    return (
      this.eventsForm.get('rule-name').invalid ||
      this.eventsForm.get('rule-description').invalid ||
      this.eventsForm.get('eventOutput').invalid ||
      this.ruleDefinitionComponent.isInvalid() ||
      this.EventMailComponent.isInvalid()
    )
  }

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

}
