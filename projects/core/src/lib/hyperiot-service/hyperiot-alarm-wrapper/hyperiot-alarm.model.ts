export namespace HytAlarm{

    export enum AlarmSuffixsEnum {
      _event_alarm,
      _event,
    }

    export interface LiveAlarm {
        alarmId: number;
        alarmName: string;
        event: {
            alarmEventId: number;
            alarmEventName: string;
            severity: number;
            alarmState: string;
            lastFiredTimestamp: number;
            ruleDefinition?: string;
        };
        projectId?: number;
        deviceIds: number[];
        packetIds?: number[];
        color: {
            background: string;
            text: string;
        },
        isEvent: boolean;
        isAlarm: boolean;
    }

    export const NotificationActiveKey = "NOTIFICATION_ACTIVE";
}
