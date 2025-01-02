import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HdevicesService, Logger, LoggerService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HDevicesActions, HDevicesApiActions } from './hDevices.actions';
 
@Injectable()
export class HDevicesEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(HDevicesActions.load),
    mergeMap(() => this.hDevicesService.findAllHDevice()
      .pipe(
        map(hDevices => {
          this.logger.debug('laod$ findAllHDevice() response', hDevices);
          return HDevicesApiActions.loadSuccess({ payload: hDevices });
        }),
        catchError((err) => {
          this.logger.debug('laod$ findAllHDevice() catchError', err);
          return of(HDevicesApiActions.loadFailure({ payload: err }));
        }),
      ))
    ) 
  );

  constructor(
    private actions$: Actions,
    private hDevicesService: HdevicesService,
    loggerService: LoggerService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HDevicesEffects");
  }
}