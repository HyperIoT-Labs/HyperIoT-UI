import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RulesService, HProject, HDevice, HPacket, Rule } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { SelectOption } from '@hyperiot/components';

@Component({
  selector: 'hyt-events-step',
  templateUrl: './events-step.component.html',
  styleUrls: ['./events-step.component.scss']
})
export class EventsStepComponent implements OnInit, OnChanges {

  @Input() hProject: HProject;

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  devicesOptions: SelectOption[] = [];

  packetsOptions: SelectOption[] = [];

  @ViewChild('eventDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  hPacketsforDevice: HPacket[] = [];

  currentPacket;

  eventList: Rule[] = [];

  eventsForm: FormGroup;

  errors: HYTError[] = [];

  outputOptions: Option[] = [
    { value: '0', label: 'SEND MAIL', checked: true },
    { value: '1', label: 'START STATISTIC' }
  ]

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.eventsForm = this.fb.group({});
  }

  ngOnChanges() {
    this.devicesOptions = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName });
    this.packetsOptions = [];
  }

  deviceChanged(event) {
    this.packetsOptions = [];
    for (let el of this.hPackets)
      if (event.value == el.device.id)
        this.packetsOptions.push({ value: el.id.toString(), label: el.name });
  }

  packetChanged(event) {
    this.currentPacket = this.hPackets.find(x => x.id == event.value);
  }

  createEvent() {

    this.errors = [];

    var action = JSON.stringify({ actionName: "AddCategoryRuleAction2", ruleId: 0, categoryIds: [456], ruleType: "ENRICHMENT" });
    var actions = [action];
    var str: string = JSON.stringify(actions);

    let rule: Rule = {
      name: this.eventsForm.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.eventsForm.value['rule-description'],
      project: this.hProject,
      packet: this.currentPacket,
      jsonActions: str,
      type: 'EVENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.eventList.push(res);
      },
      err => {
        this.errors = this.errorHandler.handleCreateRuleEnrichment(err);
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
      this.eventsForm.get('eventDevice').invalid ||
      this.eventsForm.get('eventPacket').invalid ||
      this.eventsForm.get('eventOutput').invalid ||
      this.ruleDefinitionComponent.isInvalid()
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
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

  deleteEvent() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.eventList.length; i++) {
          if (this.eventList[i].id == this.deleteId) {
            this.eventList.splice(i, 1);
          }
        }
        // this.out.emit(this.eventList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
