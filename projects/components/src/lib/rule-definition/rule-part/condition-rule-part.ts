import { IRulePart, RuleOperator } from "./rule-part.interface";
import { HPacketField, RuleNode } from "core";
import { ValueRulePart } from "./value-rule-part";
import { SelectOption } from "../../hyt-select/hyt-select.component";
import { Validators } from "@angular/forms";

export class ConditionRulePart implements IRulePart {
  fieldType: "select" | "text" = 'select';
  label = 'Condition';
  validators = [ Validators.required ];

  fieldConditionOptions: RuleOperator[] = [];
  hPacketFieldType: HPacketField.TypeEnum;

  constructor(
    operators: RuleOperator[],
    hPacketFieldType: HPacketField.TypeEnum,
  ) {
    this.hPacketFieldType = hPacketFieldType;
    this.fieldConditionOptions = operators
      .filter(o => o.appliance === RuleNode.ApplianceEnum.FIELD)
      .filter(o => o.supportedFieldTypes.includes(this.hPacketFieldType));
  }

  generateChildrenRuleParts(): Map<string, IRulePart> {
    const fieldPartsMap = new Map<string, IRulePart>();

    // add field conditions
    this.fieldConditionOptions.forEach(pc => {
      if (pc.operator !== 'isTrue' && pc.operator !== 'isFalse') {
        fieldPartsMap.set(pc.operator, new ValueRulePart(this.hPacketFieldType));
      }
    });
    
    return fieldPartsMap;
  }

  generateOptions(): SelectOption[] {
    return this.fieldConditionOptions.map(x => ({ value: x.operator, label: x.name }));
  }

  ruleify = (value: string): string => {
    return '" ' + value + ' ';
  }

  prettify = (value: string): string => {
    if (!value) {
      return '';
    }
    return ' ' + this.fieldConditionOptions.find(x => x.operator === value).name + ' ';
  }
}