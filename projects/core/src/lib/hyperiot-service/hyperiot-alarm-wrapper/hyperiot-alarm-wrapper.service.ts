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
        this._alarmSubject.next(alarm)
      }
    })

    this.eventNotificationState.subscribe(res=> localStorage.setItem(HytAlarm.NotificationActiveKey, JSON.stringify(res)))
  }

  get alarmSubject(){
    return this._alarmSubject;
  }
}
