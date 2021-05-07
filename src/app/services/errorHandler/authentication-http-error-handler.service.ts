import { Injectable } from '@angular/core';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HYTError } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpErrorHandlerService extends HttpErrorHandlerService {

  constructor() {
    super();
  }

  handleRegistration(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.error.statusCode) {
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [
              {
                message: httpError.error.errorMessages[0] + ' ' + $localize`:@@HYT_duplicate_entity:Already in use`,
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
                message: $localize`:@@HYT_unknown_error:Error executing your request`,
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
            message: $localize`:@@HYT_wrong_user_or_password:Wrong username or password`,
            container: 'general'
          }
        ];
        break;
      }
      case 403: {
        return [
          {
            message: $localize`:@@HYT_error_403:Your account is not activated. Please activate your account with the activation link we send you by email`,
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
    if(httpError.status === 404){
      return [{
        message: $localize`:@@HYT_email_not_found:Your email is not on our system,sorry.`,
        container: 'general'
      }]
    }
    return this.handle(httpError);
  }

  handlePwdReset(httpError: HttpErrorResponse): HYTError[] {
    return this.handle(httpError);
  }

}
