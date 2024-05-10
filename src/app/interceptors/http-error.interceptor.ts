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
  HttpErrorResponse,
  HttpContextToken
} from '@angular/common/http';
import { Observable, filter, tap } from 'rxjs';
import { NotificationService } from 'components';
import { ActivationEnd, Data, Router } from '@angular/router';
import { HytRoutesDataFields } from '../configuration-modules/hyt-routing.module';
import { HttpErrorsDictionary } from '../constants/httpErrorsDictionary';
import { LoggerService } from 'core';

export const ERROR_MESSAGES = new HttpContextToken(() => HttpErrorsDictionary);
export const IGNORE_ERROR_INTERCEPTOR = new HttpContextToken(() => false);

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  private lastRouteData: Data = {};

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private loggerService: LoggerService
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
    const ignoreInterceptorByRoute: boolean = this.lastRouteData[HytRoutesDataFields.IGNORE_HTTP_ERROR_INTERCEPTOR]
    const ignoreInterceptorByRequest: boolean = request.context.get(IGNORE_ERROR_INTERCEPTOR);
    this.loggerService.debug('route ignore http error interceptor:', ignoreInterceptorByRoute);
    this.loggerService.debug('request ignore http error interceptor:', ignoreInterceptorByRequest);
    if (ignoreInterceptorByRoute || ignoreInterceptorByRequest) {
      return next.handle(request);
    }
    return next.handle(request)
    .pipe(
      tap({
        error: (err: HttpErrorResponse) => {
          this.loggerService.debug('intercepted http error:', err);
          const newErrorsMessages = {
            ...HttpErrorsDictionary,
            ...request.context.get(ERROR_MESSAGES),
          };
          const errorMessage = newErrorsMessages[err.status];
          switch (err.status) {
            case 401:
            case 403:
              this.loggerService.debug('http error message to notifiy:', errorMessage);
              this.notificationService.error(errorMessage.title, errorMessage.message);
            default:
              break;
          }
        },
      })
    );
  }
}
