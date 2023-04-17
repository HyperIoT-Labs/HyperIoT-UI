import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HYTError } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor() { }

  handle(httpError: HttpErrorResponse): HYTError[] {

    switch (httpError.status) {
      case 404: {
        return [
          {
            message: $localize`:@@HYT_resource_not_found:The resource requested has not been found`,
            container: 'general'
          }
        ];
        break;
      }
      case 422: {
        return [
          {
            message: $localize`:@@HYT_resource_validation_failed:Entity is not valid`,
            container: 'general'
          }
        ];
        break;
      }
      case 409: {
        return [
          {
            message: $localize`:@@HYT_resource_duplicated:Entity already present`,
            container: 'general'
          }
        ];
        break;
      }
      case 500: {
        return [
          {
            message: $localize`:@@HYT_server_error_500:Internal error`,
            container: 'general'
          }
        ];
        break;
      }
      case 504: {
        return [
          {
            message: $localize`:@@HYT_service_temporarily_unavailable:Service temporarily unavailable`,
            container: 'general'
          }
        ];
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

  }
}
