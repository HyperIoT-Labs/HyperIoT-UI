import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RulesService, HPacket, Rule } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { RuleDefinitionComponent } from '../../../project-forms/rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { PageStatusEnum } from '../../model/pageStatusEnum';
import { EventMailComponent } from './event-mail/event-mail.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-packet-event',
  templateUrl: './packet-event.component.html',
  styleUrls: ['./packet-event.component.scss']
})
export class PacketEventComponent implements OnInit {

  submitType: string = 'ADD';

  @Input() currentPacket: HPacket;

  @ViewChild('eventDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;
  @ViewChild('eventMail', { static: false }) eventMailComponent: EventMailComponent;

  @Output() saveEvent = new EventEmitter();

  @Output() updateEvent = new EventEmitter();

  eventsForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;


  outputOptions: Option[] = [
    { value: 'SendMailAction', label: this.i18n('HYT_SEND_MAIL'), checked: true }
    // { value: '', label: 'START STATISTIC' }
  ]

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService,
    private i18n: I18n
  ) { }

  ngOnInit() {
    this.eventsForm = this.fb.group({});
    this.rulesService.findAllRuleActions('EVENT').subscribe(
      res => {
        console.log(res);
      }//TODO //this.outputOptions = res
    )
  }

  postEvent() {
    this.errors = [];
    this.saveEvent.emit();
  }

  putEvent() {
    this.errors = [];
    this.updateEvent.emit();
  }

  invalid(): boolean {
    return (
      this.eventsForm.get('rule-name').invalid ||
      this.eventsForm.get('rule-description').invalid ||
      this.eventsForm.get('eventOutput').invalid ||
      this.ruleDefinitionComponent.isInvalid() ||
      this.eventMailComponent.isInvalid()
    )
  }

  setForm(data: Rule, type: string) {
    console.log(data)
    this.resetForm(type);
    this.ruleDefinitionComponent.setRuleDefinition(data.ruleDefinition);
    this.eventMailComponent.setMail(JSON.parse(data.jsonActions));
    this.eventsForm.get('rule-description').setValue(data.description);
    this.eventsForm.get('rule-name').setValue((type == 'UPDATE') ? data.name : data.name + 'Copy');
    this.eventsForm.get('eventOutput').setValue('SendMailAction');//TODO add logic (if new output)
  }

  resetForm(type: string) {
    this.submitType = type;
    this.errors = [];
    this.ruleDefinitionComponent.resetRuleDefinition();
    this.eventMailComponent.reset();
    this.eventsForm.reset();
  }

  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  updateHint(event: string) {
    this.wizardService.updateHint(event, 6);
  }

}
