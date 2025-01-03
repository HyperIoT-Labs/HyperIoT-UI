import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { AlarmsService, HprojectsService, HytAlarm, Logger, LoggerService, RealtimeDataService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import * as LiveAlarmsActions from './live-alarms.actions';
import { Store } from '@ngrx/store';
import { HProjectsSelectors } from '../hProjects/hProjects.selectors';
import { NotificationActions } from '../notification/notification.actions';
 
@Injectable()
export class LiveAlarmsEffects {

    private logger: Logger;

    private severityColors = new Map<number, string>([
        [0, '#46A0F3'],
        [1, '#F9BE26'],
        [2, '#F35746'],
        [3, '#8E20BC'],
    ]);
    
    private DEFAULT_BACKGROUND_COLOUR = '#1f58a5';

    load$ = createEffect(() => this.actions$.pipe(
        ofType(LiveAlarmsActions.loadLiveAlarms),
        concatLatestFrom(() => this.store.select(HProjectsSelectors.selectHProjects)),
        mergeMap(
            ([action, projects]) => this.alarmsService.findAlarmStatusByProjectId(projects .map(p => p.id)).pipe(
                map(res => {
                    const liveAlarms: HytAlarm.LiveAlarm[] = [];
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
            
                        liveAlarms.push(liveAlarm);
                
                        });
                
                    });
            
                    return LiveAlarmsActions.loadLiveAlarmsSuccess({liveAlarms});
                }),
                catchError((error) => {
                    this.logger.debug('laod$ findAlarmStatusByProjectId() catchError', error);
                    return of(LiveAlarmsActions.loadLiveAlarmsFailure({error}));
                }),
            )
        )
    ));

    subscribeWs$ = createEffect(() => 
        this.actions$.pipe(
            ofType(LiveAlarmsActions.loadLiveAlarmsSuccess, LiveAlarmsActions.loadLiveAlarmsFailure),
            tap(() => this.collectAlarms())
        ),
        { dispatch: false }
    )

    constructor(
        private actions$: Actions,
        private alarmsService: AlarmsService,
        private realtimeDataService: RealtimeDataService,
        private store: Store,
        loggerService: LoggerService,
    ) {
        this.logger = new Logger(loggerService);
        this.logger.registerClass("LiveAlarmsEffects");
    }

    collectAlarms() {
        const SUFFIX = HytAlarm.AlarmSuffixsEnum;

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
            const liveAlarm : HytAlarm.LiveAlarm = {
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
                if(liveAlarm.event.alarmState == "UP"){
                    this.store.dispatch(LiveAlarmsActions.setLiveAlarm({liveAlarm}));
                }else{
                    this.store.dispatch(LiveAlarmsActions.deleteLiveAlarm({liveAlarm}));
                }
            }
            //this._alarmSubject.next(alarm)
            
            //this.store.dispatch(NotificationActions.setNotificationFromWs({alarm: liveAlarm}))
        }
        })
    }


}