import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger, LoggerService, RulesService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { RulesActions, RulesApiActions } from './rules.actions';
 
@Injectable()
export class RulesEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(RulesActions.load),
    mergeMap(() => this.rulesService.findAllRule()
      .pipe(
        map(rules => {
          this.logger.debug('laod$ findAllRule() response', rules);
          return RulesApiActions.loadSuccess({ payload: rules });
        }),
        catchError((err) => {
          this.logger.debug('laod$ findAllRule() catchError', err);
          return of(RulesApiActions.loadFailure({ payload: err }));
        }),
      ))
    ) 
  );
 
  constructor(
    private actions$: Actions,
    private rulesService: RulesService,
    loggerService: LoggerService,
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("RulesEffects");
  }
}