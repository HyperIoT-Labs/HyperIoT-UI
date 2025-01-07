import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger, LoggerService, RulesService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { RuleActions } from './rules.actions';
 
@Injectable()
export class RulesEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(RuleActions.loadRules),
    mergeMap(() => this.rulesService.findAllRule()
      .pipe(
        map(rules => {
          this.logger.debug('laod$ findAllRule() response', rules);
          return RuleActions.loadRulesSuccess({ rules });
        }),
        catchError((err) => {
          this.logger.debug('laod$ findAllRule() catchError', err);
          return of(RuleActions.loadRulesFailure({ error: err }));
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