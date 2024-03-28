import { Injectable } from "@angular/core";
import { RealtimeDataService } from "../../hyperiot-base/realtime-data-service/realtime-data.service";
import { HytAlarm } from "./hyperiot-alarm.model";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AlarmWrapperService {
  private DEFAULT_BACKGROUND_COLOUR = '#1f58a5';
  private severityColors = new Map<number, string>([
    [0, '#f8b606'],
    [1, '#f87a06'],
    [2, '#bd362f'],
    [3, '#9400d3'],
  ]);
  private _alarmSubject: Subject<HytAlarm.LiveAlarm> = new Subject()

  constructor(private realtimeDataService: RealtimeDataService) {
    const SUFFIX = HytAlarm.AlarmSuffixsEnum;
    this.realtimeDataService.eventStream.subscribe((p) => {
      const packet = p.data;
      if (packet.id === 0 && (packet.name.endsWith(SUFFIX[SUFFIX._event])
        || packet.name.endsWith(SUFFIX[SUFFIX._event_alarm]))) {
        const event = JSON.parse(packet.fields.event.value.string).data; JSON.parse(packet.fields.event.value.string).data;
        const tag = event.tags[0]; // retrieve only first tag
        let backgroundColor = this.DEFAULT_BACKGROUND_COLOUR;
        const textColor = "#fff"
        if (packet.name.endsWith(SUFFIX[SUFFIX._event])) {
          backgroundColor = tag ? tag.color : this.DEFAULT_BACKGROUND_COLOUR;
        } else if (packet.name.endsWith(SUFFIX[SUFFIX._event_alarm])) {
          backgroundColor = '#51a351'; // Resolved alarm BG (OFF state)
          if (event.alarmState === 'UP') 
            backgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_BACKGROUND_COLOUR;    
        }

        this._alarmSubject.next({
          color: {
            background: backgroundColor,
            text: textColor
          },
          event: event as HytAlarm.Event,
          packet: packet,
          isEvent: packet.name.endsWith(SUFFIX[SUFFIX._event]),
          isAlarm: packet.name.endsWith(SUFFIX[SUFFIX._event_alarm])
        })
      }
    })
  }

  get alarmSubject(){
    return this._alarmSubject;
  }
}
