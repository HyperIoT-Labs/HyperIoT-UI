/*
 *
 *  * Copyright 2019-2023 HyperIoT
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License")
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  *
 *
 */


import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, filter, tap } from 'rxjs';
import { ActivationEnd, Data, Router } from '@angular/router';
import { HytRoutesDataFields } from '../configuration-modules/hyt-routing.module';
import { LoggerService, GlobalErrorHandlerService, NotificationSeverity,
  ERROR_MESSAGES, IGNORE_ERROR_NOTIFY, NOTIFY_CHANNEL_ID 
 } from 'core';
import { ErrorMessageDefault, HttpErrorsDictionary } from '../constants/http-errors-dictionary';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  private lastRouteData: Data = {};

  constructor(
    private router: Router,
    private loggerService: LoggerService,
    private globalErrorHandlerService: GlobalErrorHandlerService
  ) {
    this.router.events
    .pipe(filter(event => event instanceof ActivationEnd))
    .subscribe({
      next: (value: ActivationEnd) => {
        this.lastRouteData = value.snapshot.data;
      }
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const ignoreErrorNotifyByRoute: boolean = this.lastRouteData[HytRoutesDataFields.IGNORE_HTTP_ERROR_NOTIFY];
    const ignoreErrorNotifyByRequest: boolean = request.context.get(IGNORE_ERROR_NOTIFY);
    const notifyChannelId = request.context.get(NOTIFY_CHANNEL_ID); 

    return next.handle(request)
    .pipe(
      tap({
        error: (err: HttpErrorResponse) => {
          this.loggerService.debug('intercepted http error:', err);
          const newErrorsMessages = {
            ...HttpErrorsDictionary,
            ...request.context.get(ERROR_MESSAGES),
          };
          const errorMessage = newErrorsMessages[err.status] || ErrorMessageDefault;
          this.globalErrorHandlerService.emitError({
            originType: 'http',
            notify: {
              show: !ignoreErrorNotifyByRoute && !ignoreErrorNotifyByRequest,
              message: errorMessage,
              channelId: notifyChannelId,
              severity: NotificationSeverity.Error
            },
            http: {
              request,
              error: err
            }
          });
        },
      })
    );
  }
}
