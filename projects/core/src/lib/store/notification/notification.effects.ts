import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HytAlarm } from "../../models/hyperiot-alarm.model";
import { of, switchMap } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { NotificationActions } from "./notification.actions";
import { LiveAlarmActions } from '../live-alarms/live-alarms.actions';
import { NotificationStore } from "./notification.reducer";

@Injectable()
export class NotificationEffects {

    private toastMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
    private toastEventMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
    private toastMessageAlarmUp = $localize`:@@HYT_dashboard_alarm_fired:The alarm has been fired`;
    private toastMessageAlarmDown = $localize`:@@HYT_dashboard_alarm_cleared:Alarm cleared`;

    convertAlarm$ = createEffect(
        () => this.actions$.pipe(
            ofType(LiveAlarmActions.setLiveAlarm, LiveAlarmActions.deleteLiveAlarm),
            switchMap(
                ({liveAlarm}) => {
                    return this.converAlarm(liveAlarm)
                }
            )
        )
    );
    
    constructor(
        private actions$: Actions,
        private toastr: ToastrService,
    ) { }

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
        const notification: NotificationStore.Notification = {
            id: toastId,
            title: alarm.event.alarmEventName,
            message: this.toastMessage,
            image: toastImage,
            bgColor: (alarm.isAlarm && alarm.event.alarmState === 'DOWN') ? '#51a351' : alarm.color.background,
            color: alarm.color.text,
        }
        return of(NotificationActions.setNotification({notification}))
    }
}