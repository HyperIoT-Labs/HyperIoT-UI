import { Injectable } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectWizardHttpErrorHandlerService extends HttpErrorHandlerService {

  constructor(i18n: I18n) {
    super(i18n);
  }

  handleCreateHProject(httpError: HttpErrorResponse) {

    switch (httpError.status) {
      case 422: {
        return [
          {
            message: 'Esiste già un progetto con lo stesso nome',
            container: 'general'
          },
          {
            message: 'unavailable project name',
            container: 'projectName'
          },
        ];
        break;
      }
      default: {
        return this.handle(httpError);
      }
    }

  }

}
