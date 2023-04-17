import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { Notification, NotificationType } from './../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public subject = new Subject<Notification>();
  public keepAfterRouteChange = true;

  constructor(
      public router: Router
    ) {

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

  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  success(title: string, message: string, keepAfterRouteChange = false) {
      this.showNotification(NotificationType.Success, title, message, keepAfterRouteChange);
  }

  error(title: string, message: string, keepAfterRouteChange = false) {
      this.showNotification(NotificationType.Error, title, message, keepAfterRouteChange);
  }

  info(title: string, message: string, keepAfterRouteChange = false) {
      this.showNotification(NotificationType.Info, title, message, keepAfterRouteChange);
  }

  warn(title: string, message: string, keepAfterRouteChange = false) {
      this.showNotification(NotificationType.Warning, title, message, keepAfterRouteChange);
  }

  showNotification(type: NotificationType, title: string,  message: string, keepAfterRouteChange = false) {
      this.keepAfterRouteChange = keepAfterRouteChange;
      this.subject.next({ type: type, title: title, message: message } as Notification);
  }

  clear() {
      this.subject.next({});
  }

}
