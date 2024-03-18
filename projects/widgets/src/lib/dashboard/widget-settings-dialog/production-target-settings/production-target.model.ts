export namespace ProductionTargetSettings {
    export interface ProductionTargetSettings {
        isTargetManuallySetOptions: any;
        isTargetManuallySet: 'true' | 'false';
        targetManuallySetValue?: string;
        fields: {
            target?: packetInfo,
            produced: packetInfo,
            current_shift?: packetInfo
        }
    }

    export interface packetInfo {
        packet: number,
        field: { [id: number]: { fieldId: number, fieldName: string }; },
    }
}