import { Injectable } from '@angular/core';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { I18n } from '@ngx-translate/i18n-polyfill';

export interface Handler {
  message: string,
  container: string,
  invalidField: string[];
}
export interface AuthenticationErrorHandlerDM {
  error: any,
  handler: Handler
}

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

  handle(httpError: HttpErrorResponse) {
    console.log(httpError.error)
    //logService.log(httpError);
    let el = this.DataModel.find(x => this.equal(x.error, httpError.error));
    if (el)
      return el.handler;
    return null;
  }

  private altroDataModel: any[] = [
    {
      errorStatus: 504,
    },
    {
      errorStatus: 404,
    },
    {
      errorStatus: 500,
    },
    {
      errorStatus: 422,
    },
  ]

  private DataModel: AuthenticationErrorHandlerDM[] = [
    {
      error: {
        statusCode: 422,
        errorMessages: ["email"],
        type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
        validationErrors: []
      },
      handler: {
        message: this.i18n('authentication_email_duplicateException'),
        container: 'email',
        invalidField: [
          'email'
        ]
      }
    },
    {
      error: {
        statusCode: 422,
        errorMessages: ["username"],
        type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
        validationErrors: []
      },
      handler: {
        message: this.i18n('authentication_huser_duplicateException'),
        container: 'user',
        invalidField: [
          'user'
        ]
      }
    },
    {
      error: {
        statusCode: 422,
        errorMessages: [],
        type: "it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException",
        validationErrors: [
          {
            message: "{it.acsoftware.hyperiot.huser.validator.passwordMustMatch.message}"
          }
        ]
      },
      handler: {
        message: this.i18n('authentication_password_must_match'),
        container: 'general',
        invalidField: [
          'password',
          'passwordConfirm'
        ]
      }
    }
  ]

}
