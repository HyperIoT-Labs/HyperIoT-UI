import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HPacketService } from '../../hyperiot-client/hyt-api/api-module';
import { catchError, map, mergeMap, of } from 'rxjs';
import { HPacketActions } from './hPackets.actions';

@Injectable()
export class HPacketsEffects {

  load$ = createEffect(() => this.actions$.pipe(
    ofType(HPacketActions.loadHPackets),
    mergeMap(() => this.hPacketsService.findAllHPacket()
      .pipe(
        map(hPackets => {
          return HPacketActions.loadHPacketsSuccess({ hPackets });
        }),
        catchError((err) => {
          return of(HPacketActions.loadHPacketsFailure({ error: err }));
        }),
      ))
    )
  );

  constructor(
    private actions$: Actions,
    private hPacketsService: HPacketService,
  ) { }
}
