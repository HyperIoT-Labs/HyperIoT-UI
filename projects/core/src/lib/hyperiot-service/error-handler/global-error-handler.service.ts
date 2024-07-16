import { ErrorHandler, Injectable } from '@angular/core';
import { Subject, filter } from 'rxjs';
import { GlobalError } from './models/error.model';
import { NotificationSeverity } from '../notification-manager/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {

  private errors: Subject<GlobalError> = new Subject();

  errorsToNotify = this.errors.pipe(filter(({notify}) => (notify.show)));

  errorsCounter = 0;

  constructor() {}

  emitError(error: GlobalError) {
    ++this.errorsCounter;
    this.errors.next({
      id: `${error.originType}-${this.errorsCounter.toString()}`,
      ...error
    });
  }

  handleError(error: any): void {
    this.emitError({
      originType: 'code',
      notify: {
        show: false,
        severity: NotificationSeverity.Error,
        message: {
          title: 'error',
          body: "something's wrong"
        }
      },
      codeError: error
    });
    throw new Error(error);
  }

}
