import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { AlarmsService } from '../../hyperiot-client/alarms-client/api-module';
import { HytAlarm } from '../../models/hyperiot-alarm.model';
import { RealtimeDataService } from '../../hyperiot-base/realtime-data-service/realtime-data.service';
import { from, of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap, filter, toArray } from 'rxjs/operators';
import { LiveAlarmActions } from './live-alarms.actions';
import { Store } from '@ngrx/store';
import { HProjectSelectors } from '../hProjects/hProjects.selectors';
import { HDeviceSelectors } from '../hDevices/hDevices.selectors';
import { RuleSelectors } from '../rules/rules.selectors';

@Injectable()
export class LiveAlarmsEffects {

    private severityColors = new Map<number, string>([
        [0, '#46A0F3'],
        [1, '#F9BE26'],
        [2, '#F35746'],
        [3, '#8E20BC'],
    ]);

    private DEFAULT_BACKGROUND_COLOUR = '#1f58a5';

    load$ = createEffect(() => this.actions$.pipe(
        ofType(LiveAlarmActions.loadLiveAlarms),
        concatLatestFrom(
            () => this.store.select(HProjectSelectors.selectHProjectEntities)
        ),
        switchMap(
            ([action, projects]) => this.alarmsService.findAlarmStatusByProjectId(Object.keys(projects).map(id => +id))
        ),
        map(res => {
            let allAlarms = [];
            res.projectsAlarmsStatus.forEach(project => {
                const alarmsByProject = project.alarmsStatuses.filter(alarm => alarm.alarmEvents.some(ae => ae.fired)).map(alarm => ({
                    ...alarm,
                    projectId: project.projectId
                }));
                allAlarms = allAlarms.concat(alarmsByProject);
            });
            return allAlarms;
        }),
        mergeMap(
            alarms => from(alarms).pipe(
                concatLatestFrom(
                    (alarm: any) => {
                        const maxSeverityEvent = alarm.alarmEvents.reduce((maxSeverityEvt, evt) => {
                            return evt.severity > maxSeverityEvt.severity ? evt : maxSeverityEvt;
                        }, alarm.alarmEvents[0]);
                        return this.store.select(HDeviceSelectors.selectHDevcicesByRuleId({ ruleId: maxSeverityEvent.ruleId }));
                    }
                ),
                map(([alarm, devices]) => {
                    const maxSeverityEvent = alarm.alarmEvents.reduce((maxSeverityEvt, evt) => {
                        return evt.severity > maxSeverityEvt.severity ? evt : maxSeverityEvt;
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
                            ruleId: maxSeverityEvent.ruleId
                        },
                        projectId: alarm.projectId,
                        color: {
                            background: this.severityColors.get(maxSeverityEvent.severity) || this.DEFAULT_BACKGROUND_COLOUR,
                            text: '#fff',
                        },
                        isEvent: false,
                        isAlarm: true,
                        deviceIds: devices.map(device => device.id),
                    };
                    return liveAlarm;
                }),
                toArray()
            ),
        ),
        map(res => {
            return LiveAlarmActions.loadLiveAlarmsSuccess({ liveAlarms: res });
        }),
        catchError((error) => {
            return of(LiveAlarmActions.loadLiveAlarmsFailure({ error }));
        }),
    ));

    subscribeWs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LiveAlarmActions.loadLiveAlarmsSuccess, LiveAlarmActions.loadLiveAlarmsFailure),
            tap(() => this.collectAlarms())
        ),
        { dispatch: false }
    )

    constructor(
        private actions$: Actions,
        private alarmsService: AlarmsService,
        private realtimeDataService: RealtimeDataService,
        private store: Store,
    ) { }

    collectAlarms() {
        const SUFFIX = HytAlarm.AlarmSuffixsEnum;

        this.realtimeDataService.eventStream.pipe(
            filter(
                (p) => {
                    const isEvent = p.data.name.endsWith(SUFFIX[SUFFIX._event]);
                    const isAlarm = p.data.name.endsWith(SUFFIX[SUFFIX._event_alarm]);
                    return p.data.id === 0 && (isEvent || isAlarm)
                }
            ),
            concatLatestFrom(
                (p) => {
                    const event = JSON.parse(p.data.fields.event.value.string).data;
                    return [
                        this.store.select(HDeviceSelectors.selectHDevcicesByRuleId({ ruleId: event.ruleId })),
                        this.store.select(RuleSelectors.selectRuleById({ id: event.ruleId }))
                    ]
                }
            ),
        ).subscribe(([p, devices, rule]) => {
            const packet = p.data;
            const isEvent = packet.name.endsWith(SUFFIX[SUFFIX._event]);
            const isAlarm = packet.name.endsWith(SUFFIX[SUFFIX._event_alarm]);
            const event = JSON.parse(packet.fields.event.value.string).data;
            const tag = event.tags[0]; // retrieve only first tag
            let backgroundColor = this.DEFAULT_BACKGROUND_COLOUR;
            const textColor = "#fff"
            if (isEvent) {
                backgroundColor = tag ? tag.color : this.DEFAULT_BACKGROUND_COLOUR;
            } else if (isAlarm) {
                backgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_BACKGROUND_COLOUR;
            }

            const deviceIds = devices.map(device => device.id);

            const liveAlarm: HytAlarm.LiveAlarm = {
                alarmId: event.alarmId,
                alarmName: event.alarmName,
                event: {
                    alarmEventName: event.ruleName,
                    severity: event.severity,
                    alarmState: event.alarmState,
                    lastFiredTimestamp: event.fireTimestamp,
                    ruleId: event.ruleId,
                    ruleDefinition: rule.ruleDefinition
                },
                projectId: rule.project.id,
                deviceIds,
                packetIds: event.packetIds,
                color: {
                    background: backgroundColor,
                    text: textColor
                },
                isEvent: isEvent,
                isAlarm: isAlarm,
            }
            // MANAGE ALARM MAP USED IN ONLINE WIDGET AND NOTIFICATION BAR
            if (isAlarm) {
                //NOT FILTER FOR PROJECT, NEED TO CHANGE REALTIME DATA SERVICE
                if (liveAlarm.event.alarmState == "UP") {
                    this.store.dispatch(LiveAlarmActions.setLiveAlarm({ liveAlarm }));
                } else {
                    this.store.dispatch(LiveAlarmActions.deleteLiveAlarm({ liveAlarm }));
                }
            }
        })
    }

}