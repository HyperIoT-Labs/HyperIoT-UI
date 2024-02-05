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
        }
        topic: string;
        fieldRules: FieldRules;
        fieldOutliers: FieldOutliers;
        period: number;
    }

    export interface FieldOutliers {
        [fieldId: number]: any;
    }

    export interface FieldRules {
        [fieldId: number]: Rule;
    }

    export type FixedNum = {
        value?: number;
    }
    
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

    export type Rule = NumRule & { type: string; };

    export const Utils = {

        WS_CONNECTED: 'MQTT Client Connected!',
        WS_UNAUTHORIZED: 'Not authorized to connect',

        expressionOperators: [
            { regex: /abs/ig, function: 'Math.abs' },
            { regex: /sin/ig, function: 'Math.sin' },
            { regex: /cos/ig, function: 'Math.cos' },
            { regex: /tan/ig, function: 'Math.tan' },
            { regex: /sqrt/ig, function: 'Math.sqrt' },
            { regex: /pow/ig, function: 'Math.pow' },
            { regex: /log/ig, function: 'Math.log' },
            { regex: /random/ig, function: 'Math.random' },
            { regex: /pi/ig, function: 'Math.PI' },
        ],

    }

}
