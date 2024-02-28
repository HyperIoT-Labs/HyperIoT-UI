import { IRulePart } from "./rule-part.interface";

export class ValueRulePart implements IRulePart {
    fieldType: "select" | "text" = 'text';
    label = 'Value';

    toString(value: string): string {
        return value;
    }
}
