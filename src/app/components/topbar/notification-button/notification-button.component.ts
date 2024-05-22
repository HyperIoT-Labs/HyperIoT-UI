import { Component, OnInit } from '@angular/core';
import { AlarmWrapperService } from 'core';
import { DashboardConfigService } from 'widgets';

@Component({
  selector: 'hyt-notification-button',
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.scss'],
})
export class NotificationButtonComponent {
  eventNotificationIsOn;
  constructor(private alarmWrapper: AlarmWrapperService) {
    this.eventNotificationIsOn = alarmWrapper.eventNotificationState.getValue();
  }


  changeEventNotificationState() {
    this.eventNotificationIsOn = !this.eventNotificationIsOn;
    this.alarmWrapper.eventNotificationState.next(this.eventNotificationIsOn);
  }
}
