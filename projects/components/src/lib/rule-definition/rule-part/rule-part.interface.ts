import { ValidatorFn } from "@angular/forms";
import { HPacketField, RuleNode } from "core";
import { SelectOption, SelectOptionGroup } from "../../hyt-select/hyt-select.component";

export type FieldType = 'select' | 'text' | 'select-group';

export interface RuleOperator {
    appliance: RuleNode.ApplianceEnum;
    name: string;
    operator: string;
    supportedFieldTypes: HPacketField.TypeEnum;
}

export interface IRulePart {
    fieldType: FieldType;
    label: string;
    validators: ValidatorFn[],
    generateOptions?(): SelectOption[];
    generateOptionsGroup?(): SelectOptionGroup[];
    generateChildrenRuleParts?(): Map<string, IRulePart>;
    ruleify: (value: string) => string;
    prettify: (value: string) => string;
}
