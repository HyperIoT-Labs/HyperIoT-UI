import { IRulePart } from "./rule-part.interface";

export class ValueRulePart implements IRulePart {
    fieldType: "select" | "text" = 'text';
    label = 'Value';

    ruleify = (value: string): string => {
        return value;
    }

    prettify = (value: string): string => {
        return value;
    }
}
