import {Component, OnInit, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, OnDestroy} from '@angular/core';

import { Notification, NotificationType, NotifyPosition } from './models/notification.model';

import { NotificationService } from './services/notification.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

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

  constructor(
    public notificationService: NotificationService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {

    if (!(this.notifyPosition in NotifyPosition)) {
      this.notifyPosition = 'notify-top-right';
    }else{
      this.notifyPosition = NotifyPosition[this.notifyPosition];
    }

    this.notificationService.getAlert()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((alert: Notification) => {

      this.notifications = [];
      if (!alert || Object.keys(alert).length === 0) {
          this.notifications = [];
          return;
      }

      this.notifications.push(alert);

      if(this.isTimed) {
        this.timeToExpire = !isNaN(+this.timeToExpire) ? this.timeToExpire : 4000
        setTimeout(() => {
          this.notifications = this.notifications.filter(x => x !== alert);
        }, this.timeToExpire);
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

    switch (notification.type) {

      case NotificationType.Success:
          return 'notify-success';

      case NotificationType.Error:
          return 'notify-error';

      case NotificationType.Info:
          return 'notify-info';

      case NotificationType.Warning:
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
