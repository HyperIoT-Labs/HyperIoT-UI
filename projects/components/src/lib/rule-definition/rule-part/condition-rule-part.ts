import { IRulePart, RuleOperator } from "./rule-part.interface";
import { RuleNode } from "core";
import { ValueRulePart } from "./value-rule-part";
import { SelectOption } from "../../hyt-select/hyt-select.component";

export class ConditionRulePart implements IRulePart {
  fieldType: "select" | "text" = 'select';
  label = 'Condition';

  fieldConditionOptions: RuleOperator[] = [];

  constructor(
    operators: RuleOperator[],
  ) {
    this.fieldConditionOptions = operators.filter(o => o.appliance === RuleNode.ApplianceEnum.FIELD);
  }

  generateChildrenRuleParts(): Map<string, IRulePart> {
    const fieldPartsMap = new Map<string, IRulePart>();

    // add field conditions
    this.fieldConditionOptions.forEach(pc => {
      if (pc.operator !== 'isTrue' && pc.operator !== 'isFalse') {
        fieldPartsMap.set(pc.operator, new ValueRulePart());
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
    return ' ' + this.fieldConditionOptions.find(x => x.operator === value).name + ' ';
  }
}