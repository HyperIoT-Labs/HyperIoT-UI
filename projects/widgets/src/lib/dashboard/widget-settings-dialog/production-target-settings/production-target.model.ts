export namespace ProductionTargetSettings {
    export interface ProductionTargetSettings {
        isTargetManuallySetOptions: any;
        isTargetManuallySet: boolean;
        targetManuallySetValue?: number;
        fields: {
            target?: packetInfo,
            produced: packetInfo,
            current_shift?: packetInfo
        }
    }

    export interface packetInfo {
        packet: number,
        field: { [id: number]: { fieldId: number, fieldName: string }; },
        fieldAlias?: string
    }
}