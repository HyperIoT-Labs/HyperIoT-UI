import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HProjectService } from '../../hyperiot-client/hyt-api/api-module';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HProjectActions } from './hProjects.actions';

@Injectable()
export class HProjectsEffects {

  load$ = createEffect(() => this.actions$.pipe(
    ofType(HProjectActions.loadHProjects),
    mergeMap(() => this.hProjectsService.cardsView()
      .pipe(
        map(hProjects => {
          return HProjectActions.loadHProjectsSuccess({ hProjects });
        }),
        catchError((err) => {
          return of(HProjectActions.loadHProjectsFailure({ error: err }));
        }),
      ))
    )
  );

  constructor(
    private actions$: Actions,
    private hProjectsService: HProjectService,
  ) { }
}
