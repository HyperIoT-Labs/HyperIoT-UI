import {FieldType, IRulePart, RuleOperator} from './rule-part.interface';
import { HPacket, HPacketFieldsHandlerService } from 'core';
import {SelectOption, SelectOptionGroup} from '../../hyt-select/hyt-select.component';
import { FieldConditionRulePart } from './field-condition-rule-part';
import { Validators } from '@angular/forms';

export class PacketRulePart implements IRulePart {
  fieldType: FieldType = 'select-group';
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

  generateOptionsGroup(): SelectOptionGroup[] {
    const optGroup: SelectOptionGroup[] = [];
    this.packetList.map((p) => {
      let currentOptGroup = optGroup.find(opts => opts.name === p.device.deviceName);
      if (currentOptGroup) {
        currentOptGroup.options = [{label: p.name, value: String(p.id), icon: 'icon-hyt_packets'}, ...currentOptGroup.options]
        optGroup.map(opg => (opg.name === p.device.deviceName) || opg)
      } else {
        currentOptGroup = {
          name: p.device.deviceName,
          options: [{
            label: p.name,
            value: String(p.id),
            icon: 'icon-hyt_packets'
          }],
          icon: 'icon-hyt_device'
        }
        optGroup.push(currentOptGroup);
      }
    });
    return optGroup;
  }

  generateOptions(): SelectOption[] {
    return this.packetList.map((p) => ({
      label: p.name,
      value: String(p.id)
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
