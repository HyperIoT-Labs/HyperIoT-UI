import { Injectable } from '@angular/core';
import { GlobalErrorHandlerService } from '../error-handler/global-error-handler.service';
import { Subject, filter, BehaviorSubject, Observer, PartialObserver, multicast, share } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { Notification, NotificationGlobalChannels, NotificationSeverity } from './models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {

  private notificationsChannel: BehaviorSubject<Notification> = new BehaviorSubject(null);

  public keepAfterRouteChange = true;

  constructor(
    private globalErrorHandler: GlobalErrorHandlerService,
    public router: Router
  ) {
    this.startGlobalErrorsSubscribe();

    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {

      if(event instanceof NavigationStart){
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
            // clear alert messages
            this.clear();
        }
      }

    });

  }

  private startGlobalErrorsSubscribe() {
    this.globalErrorHandler.errorsToNotify.subscribe(({notify, http}) => {
      if (http?.error) {
        switch (http.error.status) {
          case 401:
          case 403:
            this.showNotification(
              notify.severity || NotificationSeverity.Error,
              notify.message?.title,
              notify.message?.body,
              false,
              notify.channelId
            );
            break;
        }
      }
    });
  }

  getNotifications(id: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    return this.notificationsChannel.pipe(
      filter(notify => notify?.channelId == id)
    )
  }

  success(title: string, message: string, keepAfterRouteChange = false, channelId: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.showNotification(NotificationSeverity.Success, title, message, keepAfterRouteChange, channelId);
  }

  error(title: string, message: string, keepAfterRouteChange = false, channelId: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.showNotification(NotificationSeverity.Error, title, message, keepAfterRouteChange, channelId);
  }

  info(title: string, message: string, keepAfterRouteChange = false, channelId: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.showNotification(NotificationSeverity.Info, title, message, keepAfterRouteChange, channelId);
  }

  warn(title: string, message: string, keepAfterRouteChange = false, channelId: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.showNotification(NotificationSeverity.Warning, title, message, keepAfterRouteChange, channelId);
  }

  showNotification(severity: NotificationSeverity, title: string,  body: string, keepAfterRouteChange = false, id: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.notificationsChannel.next({
      channelId: id,
      message: {
        title,
        body
      },
      severity,
      keepAfterRouteChange,
      clear: false
    });
  }

  clear(id: string = NotificationGlobalChannels.GLOBAL_USER_TOAST) {
    this.notificationsChannel.next({
      channelId: id,
      clear: true
    });
  }

}
