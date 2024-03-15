import { HPacketField } from "core";

export namespace DataSimulatorSettings {
  export interface DataSimulatorSettings {
    deviceInfo: {
      id: number;
      name: string;
      password: string;
    };
    packetInfo: {
      packetId: number;
      packetName: string;
    };
    topic: string;
    fieldRules: FieldRules;
    fieldType: FieldType;
    fieldOutliers: FieldOutliers;
    period: number;
  }

  export interface FieldOutliers {
    [fieldId: number]: any;
  }

  export interface FieldRules {
    [fieldId: number]: Rule;
  }

  export interface FieldType {
    [fieldId: number]: HPacketField.TypeEnum;
  }

  export type FixedNum = {
    value?: number;
  };

  export interface Expression {
    expression?: string;
  }

  export interface NumRange {
    min?: number;
    max?: number;
  }

  export interface DataSet {
    values?: string;
  }

  export type NumRule = FixedNum & Expression & NumRange & DataSet;

  export type Rule = NumRule & { type: string };

  export const Utils = {
    WS_CONNECTED: "MQTT Client Connected!",
    WS_UNAUTHORIZED: "Not authorized to connect",

    expressionOperators: [
      { regex: /abs/gi, function: "Math.abs" },
      { regex: /sin/gi, function: "Math.sin" },
      { regex: /cos/gi, function: "Math.cos" },
      { regex: /tan/gi, function: "Math.tan" },
      { regex: /sqrt/gi, function: "Math.sqrt" },
      { regex: /pow/gi, function: "Math.pow" },
      { regex: /log/gi, function: "Math.log" },
      { regex: /random/gi, function: "Math.random" },
      { regex: /pi/gi, function: "Math.PI" },
    ],
  };
}
