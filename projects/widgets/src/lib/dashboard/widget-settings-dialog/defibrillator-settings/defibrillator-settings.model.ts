import { PacketField } from "../packet-fields-select/packet-fields-select.component";

export namespace DefibrillatorSettings {

    export enum Type {
        ECG = 'ECG',
        TEMP = 'TEMP',
        RESP = 'RESP',
        SPO2 = 'SPO2',
        NIBP = 'NIBP',
        IBP = 'IBP',
        CO2 = 'CO2',
        PR = 'PR',
    }

    export interface Channel {
        type: Type | null;
        color: string | null;
        min: PacketField | null;
        max: PacketField | null;
        value: PacketField | null;
        unit: string | null;
    }

    export interface DefibrillatorSettings {
        standard: {
            standardArea1: {
                channel1: Channel,
                channel2: Channel,
                channel3: Channel,
                channel4: Channel,
            },
            parametersArea1: {
                channel1?: Channel,
                channel2?: Channel,
                channel3?: Channel,
            }
            standardArea2: {
                channel1: Channel,
                channel2: Channel,
            }
            standardArea3: {
                channel1: Channel,
            }
        }
        derivations: {
            derivationsArea: {
                I: Channel,
                II: Channel,
                III: Channel,
                AVR: Channel,
                AVL: Channel,
                AVF: Channel,
                V1: Channel,
                V2: Channel,
                V3: Channel,
                V4: Channel,
                V5: Channel,
                V6: Channel,
            }
        }
    }

    export namespace Utils {

        export const typeLabels: Record<Type, string> = {
            [DefibrillatorSettings.Type.ECG]: 'ECG',
            [DefibrillatorSettings.Type.SPO2]: 'SPO2',
            [DefibrillatorSettings.Type.RESP]: 'RESP',
            [DefibrillatorSettings.Type.NIBP]: 'NIBP',
            [DefibrillatorSettings.Type.IBP]: 'IBP',
            [DefibrillatorSettings.Type.TEMP]: 'TEMP',
            [DefibrillatorSettings.Type.CO2]: 'CO2',
            [DefibrillatorSettings.Type.PR]: 'PR',
        };

        export const disabledFields: any[] = [
            ['standard', 'standardArea1', 'channel1', 'type'],
            ['derivations', 'derivationsArea', 'I', 'type'],
            ['derivations', 'derivationsArea', 'II', 'type'],
            ['derivations', 'derivationsArea', 'III', 'type'],
            ['derivations', 'derivationsArea', 'AVR', 'type'],
            ['derivations', 'derivationsArea', 'AVL', 'type'],
            ['derivations', 'derivationsArea', 'AVF', 'type'],
            ['derivations', 'derivationsArea', 'V1', 'type'],
            ['derivations', 'derivationsArea', 'V2', 'type'],
            ['derivations', 'derivationsArea', 'V3', 'type'],
            ['derivations', 'derivationsArea', 'V4', 'type'],
            ['derivations', 'derivationsArea', 'V5', 'type'],
            ['derivations', 'derivationsArea', 'V6', 'type'],
        ];

        export const requiredFields: any[] = [
            ['standard', 'standardArea1', 'channel1', 'type'],
            ['standard', 'standardArea1', 'channel1', 'color'],
            ['standard', 'standardArea1', 'channel1', 'value'],
        ];

        export const parameterTypes: Type[] = [
            Type.ECG,
            Type.RESP,
            Type.SPO2,
        ]

    }

}