import { Injectable } from '@angular/core';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Handler, RegisterField } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpErrorHandlerService extends HttpErrorHandlerService {

  constructor(private i18n: I18n) {
    super();
  }

  equal(firstError, secondError): boolean {
    if (firstError.statusCode != secondError.statusCode)
      return false;
    if (firstError.errorMessages[0] != secondError.errorMessages[0])
      return false;
    if (firstError.type != secondError.type)
      return false;
    return true;
  }

  handle(httpError: HttpErrorResponse): Handler[] {

    switch (httpError.error.statusCode) {
      case 500: {
        return [{
          message: this.i18n('server_error_500'),
          container: RegisterField.general
        }]
        break;
      }
      case 504: {
        return [{
          message: this.i18n('offline_504'),
          container: RegisterField.general
        }]
        break;
      }
      case 422: {
        switch (httpError.error.type) {
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
            return [{
              message: httpError.error.errorMessages[0] + ' ' + this.i18n('HyperIoTDuplicateEntityException'),
              container: (httpError.error.errorMessages[0] == 'username') ? RegisterField.username : RegisterField.email
            }]
          }
          case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
            var arr: any[] = [];
            for (let k of httpError.error.validationErrors)
              arr.push({
                message: k.field + k.message,
                container: k.field
              })
            return arr;
          }
        }
        break;
      }
      default: {
        return [{
          message: this.i18n('unknown_error'),
          container: RegisterField.general
        }]
      }

    }

    //logService.log(httpError);
    // let el = this.DataModel.find(x => this.equal(x.error, httpError.error));
    // if (el)
    //   return el.handler;
    return null;
  }

  handleLogin(httpError: HttpErrorResponse): Handler[] {
    switch (httpError.error.statusCode) {
      case 500: {
        return [{
          message: this.i18n('server_error_500'),
          container: RegisterField.general
        }]
        break;
      }
      case 504: {
        return [{
          message: this.i18n('offline_504'),
          container: RegisterField.general
        }]
        break;
      }
      default: {
        return [{
          message: this.i18n('unknown_error'),
          container: RegisterField.general
        }]
      }
    }
  }

  handlePwdRecovery(httpError: HttpErrorResponse): Handler[] {
    switch (httpError.error.statusCode) {
      case 500: {
        return [{
          message: this.i18n('server_error_500'),
          container: RegisterField.general
        }]
        break;
      }
      case 504: {
        return [{
          message: this.i18n('offline_504'),
          container: RegisterField.general
        }]
        break;
      }
      default: {
        return [{
          message: this.i18n('unknown_error'),
          container: RegisterField.general
        }]
      }
    }
  }

  // private DataModel: AuthenticationErrorHandlerDM[] = [
  //   {
  //     error: {
  //       statusCode: 422,
  //       errorMessages: ["email"],
  //       type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
  //       validationErrors: []
  //     },
  //     handler: {
  //       message: this.i18n('authentication_email_duplicateException'),
  //       container: 'email',
  //       invalidField: [
  //         'email'
  //       ]
  //     }
  //   },
  //   {
  //     error: {
  //       statusCode: 422,
  //       errorMessages: ["username"],
  //       type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
  //       validationErrors: []
  //     },
  //     handler: {
  //       message: this.i18n('authentication_huser_duplicateException'),
  //       container: 'user',
  //       invalidField: [
  //         'user'
  //       ]
  //     }
  //   },
  //   {
  //     error: {
  //       statusCode: 422,
  //       errorMessages: [],
  //       type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
  //       validationErrors: [
  //         {
  //           message: "{it.acsoftware.hyperiot.huser.validator.passwordMustMatch.message}"
  //         }
  //       ]
  //     },
  //     handler: {
  //       message: this.i18n('authentication_password_must_match'),
  //       container: 'general',
  //       invalidField: [
  //         'password',
  //         'passwordConfirm'
  //       ]
  //     }
  //   }
  // ]

}
