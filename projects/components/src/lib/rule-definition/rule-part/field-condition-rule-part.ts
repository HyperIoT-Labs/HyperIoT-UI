import { IRulePart, RuleOperator } from './rule-part.interface';
import { HPacket, HPacketField, HPacketFieldsHandlerService, RuleNode } from 'core';
import { ValueRulePart } from './value-rule-part';
import { ConditionRulePart } from './condition-rule-part';
import { SelectOption } from '../../hyt-select/hyt-select.component';

export class FieldConditionRulePart implements IRulePart {
  fieldType: 'select' | 'text' = 'select';
  label = 'Field or Condition';

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
    const flatFieldList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.hPacket);
    flatFieldList.forEach(field => {
      rulePartsMap.set(String(field.field.id), new ConditionRulePart(this.operators));
    });

    // add packet conditions
    this.packetConditions.forEach(pc => {
      rulePartsMap.set(pc.operator, new ValueRulePart());
    });

    // add packet timestamp conditions
    this.timestampConditions.forEach(tc => {
      rulePartsMap.set(tc.value + '(' + this.hPacket.timestampField + ')', new ConditionRulePart(this.operators));
    });
    return rulePartsMap;
  }

  generateOptions(): SelectOption[] {
    let packetOptions: SelectOption[] = [];

    // add packet fields
    const flatFieldList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.hPacket);
    packetOptions = flatFieldList.map((f) => ({
      value: String(f.field.id),
      label: this.hPacketFieldsHandlerService.getStringifiedSequenceFromPacket(this.hPacket, f.field.id),
      icon: 'icon-hyt_fields'
    }));

    // add packet conditions
    packetOptions = packetOptions.concat(this.packetConditions.map(x => ({ value: x.operator, label: x.name, icon: 'icon-hyt_setting' })));

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
    if (this.packetConditions.some(pc => pc.operator === value)) { // TODO temp, use /rules/operations instead
      return ' has not sent data for milliseconds: ';
    }
    const options = this.generateOptions();
    return '.' + options.find(op => op.value === value).label;
  }
}