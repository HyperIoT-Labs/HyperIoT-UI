import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Handler } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor() { }

  handle(httpError: HttpErrorResponse): Handler[] {
    // logService.log(error);
    return [{
      message: 'unknownError',
      container: null
    }];
  }

}
