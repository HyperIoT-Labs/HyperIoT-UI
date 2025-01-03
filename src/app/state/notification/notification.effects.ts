import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { HytAlarm, Logger, LoggerService } from "core";
import * as LiveAlarmsActions from '../live-alarms/live-alarms.actions';
import * as LiveAlarmSelectors from '../live-alarms/live-alarms.selectors';
import { Store } from "@ngrx/store";
import { exhaustMap, mergeMap, of, switchMap } from "rxjs";
import { NotificationActions } from "./notification.actions";
import { Notification } from "./notification.model";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class NotificationEffects {

    private logger: Logger;

    private toastMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
    private toastEventMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
    private toastMessageAlarmUp = $localize`:@@HYT_dashboard_alarm_fired:The alarm has been fired`;
    private toastMessageAlarmDown = $localize`:@@HYT_dashboard_alarm_cleared:Alarm cleared`;

    convertAlarm$ = createEffect(
        () => this.actions$.pipe(
            ofType(LiveAlarmsActions.setLiveAlarm, LiveAlarmsActions.deleteLiveAlarm),
            switchMap(
                ({liveAlarm}) => {
                    return this.converAlarm(liveAlarm)
                }
            )
        )
    );

    /* convertDeletedAlarm$ = createEffect(
        () => this.actions$.pipe(
            ofType(LiveAlarmsActions.deleteLiveAlarm),
            mergeMap(
                ([{id}, liveAlarms]) => {
                    return this.converAlarm(liveAlarms[id])
                }
            )
        )
    ); */
    
    
    constructor(
        private actions$: Actions,
        private store: Store,
        private toastr: ToastrService,
        loggerService: LoggerService,
    ) {
        this.logger = new Logger(loggerService);
        this.logger.registerClass("NotificationEffects");
    }

    converAlarm(alarm: HytAlarm.LiveAlarm) {
        let toastImage = "info";
        if (alarm.isEvent) {
          toastImage = "toastEvent";
          this.toastMessage = this.toastEventMessage;
        } else if (alarm.isAlarm) {
          toastImage =
            alarm.event.alarmState === "UP" ? "toastAlarmUp" : "toastAlarmDown";
          this.toastMessage =
            alarm.event.alarmState === "UP" ? this.toastMessageAlarmUp : this.toastMessageAlarmDown;
        }
        const toastId = this.toastr["index"];
        const notification: Notification = {
            id: toastId,
            title: alarm.event.alarmEventName,
            message: this.toastMessage,
            image: toastImage,
            bgColor: (alarm.isAlarm && alarm.event.alarmState === 'DOWN') ? '#51a351' : alarm.color.background,
            color: alarm.color.text,
        }
        console.log('convertAlarm')
        return of(NotificationActions.setNotification({notification}))
    }
}