export interface EcgElement {
    trace?: string;
    value?: string;
}

export interface Result {
    fields: Field[];
    timestampField: string;
}
  
export interface Field {
    name: string;
    value: number;
}
  
export interface DataModel {
  elements: Array<any>;
}
  