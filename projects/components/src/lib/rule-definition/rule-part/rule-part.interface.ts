export interface IRulePart {
    fieldType: 'select' | 'text';
    label: string;
    generateOptions?();
    generateChildrenRuleParts?(): Map<string, IRulePart>;
    ruleify: (value: string) => string;
    prettify: (value: string) => string;
}