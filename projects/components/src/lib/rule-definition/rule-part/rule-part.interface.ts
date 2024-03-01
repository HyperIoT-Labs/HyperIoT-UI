import { HPacketField, RuleNode } from "core";

export interface RuleOperator {
    appliance: RuleNode.ApplianceEnum;
    name: string;
    operator: string;
    supportedFieldTypes: HPacketField.TypeEnum; 
}

export interface IRulePart {
    fieldType: 'select' | 'text';
    label: string;
    generateOptions?();
    generateChildrenRuleParts?(): Map<string, IRulePart>;
    ruleify: (value: string) => string;
    prettify: (value: string) => string;
}