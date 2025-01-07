import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HpacketsService, Logger, LoggerService } from 'core';
import { HPacketActions } from './hPackets.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
 
@Injectable()
export class HPacketsEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(HPacketActions.loadHPackets),
    mergeMap(() => this.hPacketsService.findAllHPacket()
      .pipe(
        map(hPackets => {
          this.logger.debug('laod$ findAllHPacket() response', hPackets);
          return HPacketActions.loadHPacketsSuccess({ hPackets });
        }),
        catchError((err) => {
          this.logger.debug('laod$ findAllHPacket() catchError', err);
          return of(HPacketActions.loadHPacketsFailure({ error: err }));
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