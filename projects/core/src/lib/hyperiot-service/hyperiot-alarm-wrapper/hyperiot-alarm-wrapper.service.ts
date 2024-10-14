import { Injectable } from "@angular/core";
import { RealtimeDataService } from "../../hyperiot-base/realtime-data-service/realtime-data.service";
import { HytAlarm } from "./hyperiot-alarm.model";
import { BehaviorSubject, Subject, mergeMap } from "rxjs";
import { HprojectsService } from "../../hyperiot-client/h-project-client/api-module";
import { AlarmsService } from "../../hyperiot-client/alarms-client/api-module";

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
  private alarmsList: Map<number, HytAlarm.LiveAlarm> = new Map();
  private DEFAULT_BACKGROUND_COLOUR = '#1f58a5';
  private severityColors = new Map<number, string>([
    [0, '#46A0F3'],
    [1, '#F9BE26'],
    [2, '#F35746'],
    [3, '#8E20BC'],
  ]);
  private _alarmSubject: Subject<HytAlarm.LiveAlarm> = new Subject()

  constructor(
    private realtimeDataService: RealtimeDataService,
    private hprojectsService: HprojectsService,
    private alarmsService: AlarmsService,
  ) { }

  loadAndCollectAlarms() {
    const SUFFIX = HytAlarm.AlarmSuffixsEnum;
    this.hprojectsService.findAllHProject().pipe(
      mergeMap(res => this.alarmsService.findAlarmStatusByProjectId(res.map(p => p.id))),
    ).subscribe(res => {

      res.projectsAlarmsStatus.forEach(project => {

        const alarmsByProject = project.alarmsStatuses.filter(alarm => alarm.alarmEvents.some(ae => ae.fired));

        alarmsByProject.forEach(alarm => {

          const maxSeverityEvent = alarm.alarmEvents.reduce((maxSeverityEvt, evt) => {
            return evt.severity > evt.severity ? evt : maxSeverityEvt;
          }, alarm.alarmEvents[0]);

          const liveAlarm: HytAlarm.LiveAlarm = {
            alarmId: alarm.alarmId,
            alarmName: alarm.alarmName,
            event: {
              alarmEventId: maxSeverityEvent.alarmEventId,
              alarmEventName: maxSeverityEvent.alarmEventName,
              severity: maxSeverityEvent.severity,
              ruleDefinition: maxSeverityEvent.ruleDefinition,
              lastFiredTimestamp: maxSeverityEvent.lastFiredTimestamp,
              alarmState: 'UP',
            },
            projectId: project.projectId,
            color: {
              background: this.severityColors.get(maxSeverityEvent.severity) || this.DEFAULT_BACKGROUND_COLOUR,
              text: '#fff',
            },
            isEvent: false,
            isAlarm: true,
          };
          this.alarmsList.set(alarm.alarmId, liveAlarm);

          // Uncomment to display alerts with toast messages
          // this._alarmSubject.next(liveAlarm);

        });

      });

    });

    this.realtimeDataService.eventStream.subscribe((p) => {
      const packet = p.data;
      const isEvent = packet.name.endsWith(SUFFIX[SUFFIX._event]);
      const isAlarm = packet.name.endsWith(SUFFIX[SUFFIX._event_alarm]);
      if (packet.id === 0 && (isEvent || isAlarm)) {
        const event = JSON.parse(packet.fields.event.value.string).data;
        const tag = event.tags[0]; // retrieve only first tag
        let backgroundColor = this.DEFAULT_BACKGROUND_COLOUR;
        const textColor = "#fff"
        if (isEvent) {
          backgroundColor = tag ? tag.color : this.DEFAULT_BACKGROUND_COLOUR;
        } else if (isAlarm) {
          backgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_BACKGROUND_COLOUR;    
        }
        const alarm : HytAlarm.LiveAlarm = {
          alarmId: event.alarmId,
          alarmName: event.alarmName,
          event: {
            alarmEventId: event.ruleId,
            alarmEventName: event.ruleName,
            severity: event.severity,
            alarmState: event.alarmState,
            lastFiredTimestamp: event.fireTimestamp,
          },
          deviceId: event.deviceId,
          packetIds: event.packetIds,
          color: {
            background: backgroundColor,
            text: textColor
          },
          isEvent: isEvent,
          isAlarm: isAlarm,
        }
        // MANAGE ALARM MAP USED IN ONLINE WIDGET AND NOTIFICATION BAR
        if(isAlarm){
          //NOT FILTER FOR PROJECT, NEED TO CHANGE REALTIME DATA SERVICE
          if(alarm.event.alarmState == "UP"){
            this.alarmsList.set(alarm.alarmId, alarm);
          }else{
            this.alarmsList.delete(alarm.alarmId);
          }
        }
        this._alarmSubject.next(alarm)
      }
    })

    this.eventNotificationState.subscribe(res=> localStorage.setItem(HytAlarm.NotificationActiveKey, JSON.stringify(res)));
  }

  get alarmSubject(){
    return this._alarmSubject;
  }

  /**
   * Return alarmList map as array sorted by event fire date
   */
  get alarmListArray() : HytAlarm.LiveAlarm[]{
    return Array.from(this.alarmsList.values()).sort((alarm1, alarm2) => {
      if (alarm1.event.lastFiredTimestamp < alarm2.event.lastFiredTimestamp ) {
        return 1;
      }
      if (alarm1.event.lastFiredTimestamp > alarm2.event.lastFiredTimestamp) {
        return -1;
      }
      return 0;
    });
  }

}
