import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RulesService, HProject, HDevice, HPacket } from '@hyperiot/core';
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

    console.log(this.eventsForm.value)

  }

  invalid(): boolean {
    return (
      this.eventsForm.get('eventName').invalid ||
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

}
