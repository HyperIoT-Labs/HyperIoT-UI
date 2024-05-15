import { AssetTag } from "../../hyperiot-client/models/assetTag";
import { HPacket } from "../../hyperiot-client/models/hPacket";

export namespace HytAlarm{
    export interface Event {
        severity: number;
        active: boolean;
        alarmName: string;
        deviceName: string | null;
        deviceId: number;
        tags: AssetTag[];
        packetIds: number[];
        alarmState: string;
        ruleType: string;
        alarmId: number;
        ruleName: string;
        firePayload: string;
        ruleId: number;
        fireTimestamp: number;
        bundleContext: string|null;
        actionName: string;
    }

    export enum AlarmSuffixsEnum {
      _event_alarm,
      _event,
    }

    export interface AlarmPacket extends Omit<HPacket, 'device' | 'fields'>{
        device: number;
        fields: any;
    }

    export interface LiveAlarm {
        event: Event,
        packet: AlarmPacket,
        color: {
            background: string,
            text: string, 
        },
        isEvent: boolean,
        isAlarm: boolean
    }
}


