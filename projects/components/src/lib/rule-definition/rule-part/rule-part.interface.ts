export interface IRulePart {
    fieldType: 'select' | 'text';
    label: string;
    generateOptions?();
    generateChildrenRuleParts?(): Map<string, IRulePart>;
    toString(value: string): string;
}