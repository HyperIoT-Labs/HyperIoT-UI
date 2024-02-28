import { IRulePart } from './rule-part.interface';
import { HPacket, HPacketField, HPacketFieldsHandlerService } from 'core';
import { ValueRulePart } from './value-rule-part';
import { ConditionRulePart } from './condition-rule-part';
import { SelectOption } from '../../hyt-select/hyt-select.component';

export class FieldConditionRulePart implements IRulePart {
  fieldType: 'select' | 'text' = 'select';
  label = 'Field or Condition';

  private hPacket: HPacket;
  constructor(
    packet: HPacket,
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService
  ) {
    this.hPacket = packet;
  }
  generateChildrenRuleParts(): Map<string, IRulePart> {
    const rulePartsMap = new Map<string, IRulePart>();

    // add packet fields
    const flatFieldList = this.hPacketFieldsHandlerService.flatPacketFieldsTree(this.hPacket);
    flatFieldList.forEach(field => {
      rulePartsMap.set(String(field.field.id), new ConditionRulePart());
    });

    // add packet conditions
    this.packetConditions.forEach(pc => {
      rulePartsMap.set(pc.value, new ValueRulePart());
    });

    // add packet timestamp conditions
    this.timestampConditions.forEach(tc => {
      rulePartsMap.set(tc.value + '(' + this.hPacket.timestampField + ')', new ConditionRulePart());
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
    packetOptions = packetOptions.concat(this.packetConditions.map(x => ({ value: x.value, label: x.label, icon: 'icon-hyt_setting' })));

    // add packet timestamp conditions
    packetOptions = packetOptions.concat(this.timestampConditions.map(x => ({
      value: x.value + '(' + this.hPacket.timestampField + ')',
      label: this.hPacket.timestampField + x.label,
      icon: 'icon-hyt_clock',
    })));

    return packetOptions;
  }

  packetConditions = [
    { value: '@@', label: ' Periodicity (ms)' },
  ];

  timestampConditions = [
    { value: 'day', label: ' (Day)' },
    { value: 'month', label: ' (Month)' },
    { value: 'hour', label: ' (Hour)' },
  ];

  toString(value: string): string {
    if ([ // TODO
      { value: '@@', label: ' Periodicity (ms)' }
    ].map(pc => pc.value).includes(value)) {
      return '" ' +  value + ' ';
    }
    return '.' + value;
  }
}