import { IRulePart, RuleOperator } from './rule-part.interface';
import { HPacket, HPacketField, HPacketFieldsHandlerService, RuleNode } from 'core';
import { ValueRulePart } from './value-rule-part';
import { ConditionRulePart } from './condition-rule-part';
import { SelectOption } from '../../hyt-select/hyt-select.component';
import { Validators } from '@angular/forms';
import { operationNameLabels } from './operations.utils';

export class FieldConditionRulePart implements IRulePart {
  fieldType: 'select' | 'text' = 'select';
  label = 'Field or Condition';
  validators = [ Validators.required ];

  packetConditions: RuleOperator[] = [];

  private hPacket: HPacket;

  constructor(
    packet: HPacket,
    private operators: RuleOperator[],
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
  ) {
    this.packetConditions = operators.filter(o => o.appliance === RuleNode.ApplianceEnum.PACKET);
    this.hPacket = packet;
  }

  generateChildrenRuleParts(): Map<string, IRulePart> {
    const rulePartsMap = new Map<string, IRulePart>();

    // add packet fields
    let flatFieldList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.hPacket);
    // use single fields only
    flatFieldList = flatFieldList.filter(ff => ff.field.multiplicity === HPacketField.MultiplicityEnum.SINGLE);
    flatFieldList.forEach(field => {
      rulePartsMap.set(String(field.field.id), new ConditionRulePart(this.operators, field.field.type));
    });

    // add packet conditions
    this.packetConditions.forEach(pc => {
      rulePartsMap.set(pc.operator, new ValueRulePart(HPacketField.TypeEnum.TIMESTAMP));
    });

    // add packet timestamp conditions
    this.timestampConditions.forEach(tc => {
      rulePartsMap.set(tc.value + '(' + this.hPacket.timestampField + ')', new ConditionRulePart(this.operators, HPacketField.TypeEnum.TIMESTAMP));
    });
    return rulePartsMap;
  }

  generateOptions(): SelectOption[] {
    let packetOptions: SelectOption[] = [];

    // add packet fields
    let flatFieldList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.hPacket);
    // use single fields only
    flatFieldList = flatFieldList.filter(ff => ff.field.multiplicity === HPacketField.MultiplicityEnum.SINGLE);
    packetOptions = flatFieldList.map((f) => ({
      value: String(f.field.id),
      label: this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.hPacket, f.field.id),
      icon: 'icon-hyt_fields'
    }));

    // add packet conditions
    packetOptions = packetOptions.concat(this.packetConditions.map(x => ({
      value: x.operator,
      label: operationNameLabels.find(y => y.name === x.name).label,
      icon:'icon-hyt_setting',
    })));

    // add packet timestamp conditions
    packetOptions = packetOptions.concat(this.timestampConditions.map(x => ({
      value: x.value + '(' + this.hPacket.timestampField + ')',
      label: this.hPacket.timestampField + x.label,
      icon: 'icon-hyt_clock',
    })));

    return packetOptions;
  }

  timestampConditions = [
    { value: 'day', label: ' (Day)' },
    { value: 'month', label: ' (Month)' },
    { value: 'hour', label: ' (Hour)' },
  ];

  ruleify = (value: string): string => {
    if (this.packetConditions.some(pc => pc.operator === value)) {
      return '" ' +  value + ' ';
    }
    return '.' + value;
  }

  prettify = (value: string): string => {
    if (!value) {
      return '';
    }
    if (this.packetConditions.some(pc => pc.operator === value)) {
      const conditionName = this.packetConditions.find(pc => pc.operator === value).name;
      return ' ' + operationNameLabels.find(x => x.name === conditionName).pretty + ' ';
    }
    const options = this.generateOptions();
    return '.' + options.find(op => op.value === value).label;
  }
}