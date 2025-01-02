import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HprojectsService, Logger, LoggerService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { HProjectsActions, HProjectsApiActions } from './hProjects.actions';
 
@Injectable()
export class HProjectsEffects {

  private logger: Logger;

  load$ = createEffect(() => this.actions$.pipe(
    ofType(HProjectsActions.load),
    mergeMap(() => this.hProjectsService.cardsView()
      .pipe(
        map(hProjects => {
          this.logger.debug('laod$ cardsView() response', hProjects);
          return HProjectsApiActions.loadSuccess({ payload: hProjects });
        }),
        catchError((err) => {
          this.logger.debug('laod$ cardsView() catchError', err);
          return of(HProjectsApiActions.loadFailure({ payload: err }));
        }),
      ))
    ) 
  );
 
  constructor(
    private actions$: Actions,
    private hProjectsService: HprojectsService,
    loggerService: LoggerService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HProjectsEffects");
  }
}