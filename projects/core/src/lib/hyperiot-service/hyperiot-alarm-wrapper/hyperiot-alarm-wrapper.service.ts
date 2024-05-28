import { Injectable } from "@angular/core";
import { RealtimeDataService } from "../../hyperiot-base/realtime-data-service/realtime-data.service";
import { HytAlarm } from "./hyperiot-alarm.model";
import { BehaviorSubject, Subject } from "rxjs";

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
