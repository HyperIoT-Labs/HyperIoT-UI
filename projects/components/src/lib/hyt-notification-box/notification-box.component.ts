import {Component, OnInit, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, OnDestroy} from '@angular/core';

/* import { Notification, NotificationSeverity, NotifyPosition } from './models/notification.model'; */

import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { NotificationGlobalChannels, NotificationManagerService, Notification, NotificationSeverity, NotifyPosition } from 'core';
@Component({
  selector: 'hyt-notification-box',
  templateUrl: './notification-box.component.html',
  styleUrls: ['./notification-box.component.scss']
})
export class HytNotificationBoxComponent implements OnInit, AfterViewInit, OnDestroy {


  @ViewChild('containerNotify', { static: true }) containerNotify: ElementRef;

  @Input('notify-position') notifyPosition = 'notify-top-right';

  @Input('is-timed') isTimed = true;

  @Input('time-to-expire-in-ms') timeToExpire = 4000;

  @Input('append-to') appendTo: string = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  notifications: Notification[] = [];

  @Input('channel-id') channelId: string = NotificationGlobalChannels.GLOBAL_USER_TOAST;

  notificationsChannel: Observable<Notification>;

  constructor(
    public notificationManagerService: NotificationManagerService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    if (!(this.notifyPosition in NotifyPosition)) {
      this.notifyPosition = 'notify-top-right';
    }else{
      this.notifyPosition = NotifyPosition[this.notifyPosition];
    }

    this.notificationsChannel = this.notificationManagerService.getNotifications(this.channelId);
    this.notificationsChannel
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(alert) => {
        this.notifications = [];
        if (alert.clear) {
            return;
        }

        this.notifications.push(alert);

        if(this.isTimed) {
          this.timeToExpire = !isNaN(+this.timeToExpire) ? this.timeToExpire : 4000
          setTimeout(() => {
            this.notifications = this.notifications.filter(x => x !== alert);
          }, this.timeToExpire);
        }
      }
    });
  }

  ngAfterViewInit() {

    this.renderer.appendChild(document.body, this.containerNotify.nativeElement);

  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(x => x !== notification);
  }

  /**
   * Set css class for Alert -- Called from alert component
   */
  setCssClass(notification: Notification) {

    if (!notification) {
      return;
    }

    switch (notification.severity) {

      case NotificationSeverity.Success:
          return 'notify-success';

      case NotificationSeverity.Error:
          return 'notify-error';

      case NotificationSeverity.Info:
          return 'notify-info';

      case NotificationSeverity.Warning:
          return 'notify-warning';

    }
  }

  ngOnDestroy() {
    this.notifications = [];
    this.renderer.removeChild(document.body, this.containerNotify.nativeElement);
    if(this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

}
