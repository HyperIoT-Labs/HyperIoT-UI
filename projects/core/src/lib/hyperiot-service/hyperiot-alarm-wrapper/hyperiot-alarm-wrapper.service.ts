import { Injectable } from "@angular/core";
import { RealtimeDataService } from "../../hyperiot-base/realtime-data-service/realtime-data.service";
import { HytAlarm } from "./hyperiot-alarm.model";
import { BehaviorSubject, Subject } from "rxjs";
import { alarmMocked } from "./alarm";
import { EmitAlarm } from "./alarm-to-emit";

@Injectable({
  providedIn: "root",
})
export class AlarmWrapperService {
  /**
   * Flag if the notification is active, saved in localStorage the preference
   */
  public eventNotificationState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem(HytAlarm.NotificationActiveKey)) ?? true);
  /**
   * Map contain all the active alarm
   */
  alarmsList: Map<number, HytAlarm.LiveAlarm> = new Map();
  /**
   * Map contain all the alarm that need to be animated out and after removed
   */
  alarmListToRemove: Map<number, boolean> = new Map();
  private DEFAULT_BACKGROUND_COLOUR = '#1f58a5';
  private severityColors = new Map<number, string>([
    [0, '#46A0F3'],
    [1, '#F9BE26'],
    [2, '#F35746'],
    [3, '#8E20BC'],
  ]);
  private _alarmSubject: Subject<HytAlarm.LiveAlarm> = new Subject()

  constructor(private realtimeDataService: RealtimeDataService) {
    const SUFFIX = HytAlarm.AlarmSuffixsEnum;

    // let index = 0;
    // EmitAlarm.data.fields.event.id = index;
    // EmitAlarm.data.fields.event.value.string = `{\"specversion\":\"1.0\",\"id\":\"${index}\",\"source\":\"http://dashboard-test.hyperiot.cloud/\",\"type\":\"SevUnderZero\",\"data\":{\"severity\": ${index % 4},\"active\":true,\"alarmName\":\"Integer Under Zero\",\"deviceName\":null,\"deviceId\":6728,\"tags\":[{\"id\":342,\"entityVersion\":1,\"entityCreateDate\":1646316178594,\"entityModifyDate\":1646316178594,\"name\":\"Temperatura Alta\",\"owner\":{\"ownerResourceName\":\"it.acsoftware.hyperiot.hproject\",\"ownerResourceId\":252,\"userId\":0,\"resourceName\":\"it.acsoftware.hyperiot.hproject\"},\"description\":\"\",\"color\":\"#f5360d\"}],\"alarmState\":\"UP\",\"packetIds\":[6729],\"ruleType\":\"ALARM_EVENT\",\"alarmId\":${index},\"ruleName\":\"SevUnderZero\",\"firePayload\":\"\\nPacket:\\n\\tInteger : 5\\n\\ttimestamp : 2024-05-30 08:29:67 +0000\\n\\n\",\"ruleId\":6732,\"fireTimestamp\":1717057796067,\"bundleContext\":null,\"actionName\":\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\"}}`

    // setInterval(()=>{
    //   index++;
    //   EmitAlarm.data.fields.event.id = index;
    //   EmitAlarm.data.fields.event.value.string = `{\"specversion\":\"1.0\",\"id\":\"${index}\",\"source\":\"http://dashboard-test.hyperiot.cloud/\",\"type\":\"SevUnderZero\",\"data\":{\"severity\": ${index % 4},\"active\":true,\"alarmName\":\"Integer Under Zero\",\"deviceName\":null,\"deviceId\":6728,\"tags\":[{\"id\":342,\"entityVersion\":1,\"entityCreateDate\":1646316178594,\"entityModifyDate\":1646316178594,\"name\":\"Temperatura Alta\",\"owner\":{\"ownerResourceName\":\"it.acsoftware.hyperiot.hproject\",\"ownerResourceId\":252,\"userId\":0,\"resourceName\":\"it.acsoftware.hyperiot.hproject\"},\"description\":\"\",\"color\":\"#f5360d\"}],\"alarmState\":\"UP\",\"packetIds\":[6729],\"ruleType\":\"ALARM_EVENT\",\"alarmId\":${index},\"ruleName\":\"SevUnderZero\",\"firePayload\":\"\\nPacket:\\n\\tInteger : 5\\n\\ttimestamp : 2024-05-30 08:29:67 +0000\\n\\n\",\"ruleId\":6732,\"fireTimestamp\":1717057796067,\"bundleContext\":null,\"actionName\":\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\"}}`
    //   this.realtimeDataService.eventStream.next(EmitAlarm)
    // }, 1000)

    this.realtimeDataService.eventStream.subscribe((p) => {
      const packet = p.data;
      const isEvent = packet.name.endsWith(SUFFIX[SUFFIX._event]);
      const isAlarm = packet.name.endsWith(SUFFIX[SUFFIX._event_alarm]);
      if (packet.id === 0 && (isEvent || isAlarm)) {
        const event = JSON.parse(packet.fields.event.value.string).data; JSON.parse(packet.fields.event.value.string).data;
        const tag = event.tags[0]; // retrieve only first tag
        let backgroundColor = this.DEFAULT_BACKGROUND_COLOUR;
        const textColor = "#fff"
        if (isEvent) {
          backgroundColor = tag ? tag.color : this.DEFAULT_BACKGROUND_COLOUR;
        } else if (isAlarm) {
          backgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_BACKGROUND_COLOUR;    
        }
        const alarm : HytAlarm.LiveAlarm = {
          color: {
            background: backgroundColor,
            text: textColor
          },
          event: event as HytAlarm.Event,
          packet: packet,
          isEvent: isEvent,
          isAlarm: isAlarm
        }
        // MANAGE ALARM MAP USED IN ONLINE WIDGET AND NOTIFICATION BAR
        if(isAlarm){
          //NOT FILTER FOR PROJECT, NEED TO CHANGE REALTIME DATA SERVICE
          if(alarm.event.alarmState == "UP"){
            this.alarmsList.set(alarm.event.alarmId, alarm);
          }else{
            // ANIMATE ALARM USING ALARMSTATE AND AFTER D
            this.alarmListToRemove.set(alarm.event.alarmId, true);
            setTimeout(()=>{
              this.alarmsList.delete(alarm.event.alarmId);
              this.alarmListToRemove.delete(alarm.event.alarmId);
            }, 1000)
          }
        }
        this._alarmSubject.next(alarm)
      }
    })

    this.eventNotificationState.subscribe(res=> localStorage.setItem(HytAlarm.NotificationActiveKey, JSON.stringify(res)))
  }

  get alarmSubject(){
    return this._alarmSubject;
  }

  /**
   * Return alarmList map as array
   */
  get alarmListArray() : HytAlarm.LiveAlarm[]{
    return Array.from(this.alarmsList.values());
  }
}
