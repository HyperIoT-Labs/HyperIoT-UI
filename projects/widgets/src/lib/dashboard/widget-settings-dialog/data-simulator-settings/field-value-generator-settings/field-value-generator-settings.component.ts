import { Component, Input, OnInit } from '@angular/core';
import { HPacketField } from 'core';
import { DataSimulatorSettings } from '../data-simulator.models';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'hyperiot-field-value-generator-settings',
  templateUrl: './field-value-generator-settings.component.html',
  styleUrls: ['./field-value-generator-settings.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class FieldValueGeneratorSettingsComponent implements OnInit {

  @Input() field: HPacketField;
  @Input() rule: DataSimulatorSettings.Rule;
  @Input() settingsForm: NgForm;

  allRuleOptions = [
    {
      value: 'fixed',
      label: 'Fixed Value',
      fields: [
        { type: HPacketField.TypeEnum.BOOLEAN, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.TEXT, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
      ],
    },
    {
      value: 'range',
      label: 'Range',
      fields: [
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
      ],
    },
    {
      value: 'dataset',
      label: 'Dataset',
      fields: [
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.ARRAY },
      ],
    },
    {
      value: 'expression',
      label: 'Expression',
      fields: [
        { type: HPacketField.TypeEnum.INTEGER, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.FLOAT, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
        { type: HPacketField.TypeEnum.DOUBLE, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
      ],
    },
    {
      value: 'random',
      label: 'Random',
      fields: [
        { type: HPacketField.TypeEnum.BOOLEAN, multiplicity: HPacketField.MultiplicityEnum.SINGLE },
      ],
    },
  ];

  ruleOptions = [];

  genType: string;

  ngOnInit(): void {
    this.genType = this.rule.type;
    this.ruleOptions = this.allRuleOptions.filter(rule => rule.fields.some(field => field.type === this.field.type && field.multiplicity === this.field.multiplicity));
  }

  get isBooleanField(){  
    return this.field.type == HPacketField.TypeEnum.BOOLEAN
  }

  onGenTypeChange() {
    this.rule.type = this.genType;
  }

}
