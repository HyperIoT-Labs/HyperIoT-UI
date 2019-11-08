import { Injectable } from '@angular/core';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { HYTError } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpErrorHandlerService extends HttpErrorHandlerService {

  constructor(i18n: I18n) {
    super(i18n);
  }

  handleRegistration(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.error.statusCode) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: httpError.error.errorMessages[0] + ' ' + this.i18n('HYT_duplicate_entity'),
                container: (httpError.error.errorMessages[0] === 'username') ? 'username' : 'email'
              }
            ];
            break;
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            const errors: HYTError[] = [];
            for (const k of httpError.error.validationErrors) {
              errors.push({ message: k.message, container: k.field });
            }
            return errors;
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
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }

  }

  handleLogin(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.status) {
      case 401: {
        return [
          {
            message: this.i18n('HYT_wrong_user_or_password'),
            container: 'general'
          }
        ];
        break;
      }
      case 403: {
        return [
          {
            message: this.i18n('HYT_error_403'),
            container: 'general'
          }
        ];
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }

  }

  handlePwdRecovery(httpError: HttpErrorResponse): HYTError[] {
    return this.handle(httpError);
  }

  handlePwdReset(httpError: HttpErrorResponse): HYTError[] {
    return this.handle(httpError);
  }

}
