import { IRulePart } from "./rule-part.interface";
import { HPacket, HPacketField, HPacketFieldsHandlerService } from "core";
import { ValueRulePart } from "./value-rule-part";
import { SelectOption } from "../../hyt-select/hyt-select.component";

export class ConditionRulePart implements IRulePart {
  fieldType: "select" | "text" = 'select';
  label = 'Condition';

  // hPacketField: HPacketField;

  constructor(
    // hPacketField: HPacketField,
  ) {
    // this.hPacketField = hPacketField;
  }
  generateChildrenRuleParts(): Map<string, IRulePart> {
    const fieldPartsMap = new Map<string, IRulePart>();

    // add field conditions
    this.allConditionOptions.forEach(pc => {
      if (pc.value !== 'isTrue' && pc.value !== 'isFalse') {
        fieldPartsMap.set(pc.value, new ValueRulePart());
      }
    });
    
    return fieldPartsMap;

  }
  generateOptions(): SelectOption[] {
    return this.allConditionOptions.map(x => ({value: x.value, label: x.label}));
  }

  allConditionOptions = [
    {
      value: '>',
      label: $localize`:@@HYT_(>)_greater:(>) Greater`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'],
    },
    {
      value: '>=',
      label: $localize`:@@HYT_(>=)_greater_equal:(>=) Greater/Equal`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'],
    },
    {
      value: '<',
      label: $localize`:@@HYT_(<)_lower:(<) Lower`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'],
    },
    {
      value: '<=',
      label: $localize`:@@HYT_(<=)_lower_equal:(<=) Lower/Equal`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE'],
    },
    {
      value: '==',
      label: $localize`:@@HYT_(==)_equal:(=) Equal`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'],
    },
    {
      value: '!=',
      label: $localize`:@@HYT_(!=)_different:(!=) Different`,
      type: ['OBJECT', 'INTEGER', 'DOUBLE', 'FLOAT', 'DATE', 'TEXT'],
    },
    {
      value: 'isTrue',
      label: $localize`:@@HYT_is_true:Is true`,
      type: ['OBJECT', 'BOOLEAN'],
    },
    {
      value: 'isFalse',
      label: $localize`:@@HYT_is_false:Is false`,
      type: ['OBJECT', 'BOOLEAN'],
    },
  ];

  ruleify = (value: string): string => {
    return '" ' + value + ' ';
  }

  prettify = (value: string): string => {
    return ' ' + this.allConditionOptions.find(x => x.value === value).label + ' ';
  }
}