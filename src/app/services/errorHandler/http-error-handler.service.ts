import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HYTError } from './models/models';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(protected i18n: I18n) { }

  handle(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.status) {
      case 404: {
        return [
          {
            message: 'Service temporarily unavaiable',
            container: 'general'
          }
        ];
        break;
      }
      case 500: {
        return [
          {
            message: this.i18n('HYT_server_error_500'),
            container: 'general'
          }
        ];
        break;
      }
      case 504: {
        return [
          {
            message: this.i18n('HYT_offline_504'),
            container: 'general'
          }
        ];
        break;
      }
      default: {
        return [
          {
            message: this.i18n('HYT_unknown_error'),
            container: 'general'
          }
        ];
      }
    }

  }

}
