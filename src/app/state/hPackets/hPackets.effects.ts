import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HpacketsService, Logger, LoggerService } from 'core';
import { HPacketsActions, HPacketsApiActions } from './hPackets.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
 
@Injectable()
export class HPacketsEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(HPacketsActions.load),
    mergeMap(() => this.hPacketsService.findAllHPacket()
      .pipe(
        map(hPackets => {
          this.logger.debug('laod$ findAllHPacket() response', hPackets);
          return HPacketsApiActions.loadSuccess({ payload: hPackets });
        }),
        catchError((err) => {
          this.logger.debug('laod$ findAllHPacket() catchError', err);
          return of(HPacketsApiActions.loadFailure({ payload: err }));
        }),
      ))
    ) 
  );
 
  constructor(
    private actions$: Actions,
    private hPacketsService: HpacketsService,
    loggerService: LoggerService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HPacketsEffects");
  }
}