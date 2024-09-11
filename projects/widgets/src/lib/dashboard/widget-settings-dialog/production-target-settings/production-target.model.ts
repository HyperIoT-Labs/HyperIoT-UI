export namespace ProductionTargetSettings {
    export interface ProductionTargetSettings {
        target: {
            isTargetManuallySetOptions: any;
            isTargetManuallySet: boolean;
            manuallySetField?: manuallySetField;
            dynamicallySetField?: packetInfo;
        },
        produced: packetInfo,
        current_shift?: packetInfo
        remaining: {
            fieldAlias: string;
        }
    }

    export interface manuallySetField {
        targetManuallySetValue?: number;
        fieldAlias?: string;
    }
    export interface packetInfo {
        packet?: number,
        field?: { [id: number]: { fieldId: number, fieldName: string }; },
        fieldAlias?: string;
    }
}