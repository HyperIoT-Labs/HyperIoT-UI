export namespace ProductionTargetSettings {
    export interface ProductionTargetSettings {
        isTargetManuallySet: boolean;
        targetManuallySetValue?: string;
        fields: {
            target?: packetInfo,
            produced: packetInfo,
            current_shift?: packetInfo
        }
    }

    export interface packetInfo {
        packet: number,
        field: number
    }
}