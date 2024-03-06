import { IRulePart, RuleOperator } from './rule-part.interface';
import { HPacket, HPacketFieldsHandlerService } from 'core';
import { SelectOption } from '../../hyt-select/hyt-select.component';
import { FieldConditionRulePart } from './field-condition-rule-part';
import { Validators } from '@angular/forms';

export class PacketRulePart implements IRulePart {
  fieldType: 'select' | 'text' = 'select';
  label = $localize`:@@HYT_packet_rule_part_label:Packet`;
  validators = [ Validators.required ];

  private packetList: HPacket[];
  constructor(
    packetList: HPacket[],
    private operators: RuleOperator[],
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService,
  ) {
    this.packetList = packetList;
  }

  generateChildrenRuleParts(): Map<string, IRulePart> {
    return new Map<string, IRulePart>(this.packetList.map(x => ([String(x.id), new FieldConditionRulePart(x, this.operators, this.hPacketFieldsHandlerService)])));
  }

  generateOptions(): SelectOption[] {
    return this.packetList.map((p) => ({
      label: p.name,
      value: String(p.id),
    }));
  }

  ruleify = (value: string): string => {
    return '"' + value;
  }

  prettify = (value: string): string => {
    if (!value) {
      return '';
    }
    const hPacket = this.packetList.find(x => String(x.id) === value);
    return hPacket.device.deviceName + '.' + hPacket.name;
  }
}