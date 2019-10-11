import { TestBed } from '@angular/core/testing';

import { HttpErrorHandlerService } from './http-error-handler.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

describe('HttpErrorHandlerService', () => {
  let i18n: I18n;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: I18n, useValue: i18n}
    ]
  }));

  it('should be created', () => {
    const service: HttpErrorHandlerService = TestBed.get(HttpErrorHandlerService);
    expect(service).toBeTruthy();
  });
});
