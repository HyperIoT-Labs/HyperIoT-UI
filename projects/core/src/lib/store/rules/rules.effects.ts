import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {RuleEngineService} from '../../hyperiot-client/hyt-api/api-module';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { RuleActions } from './rules.actions';

@Injectable()
export class RulesEffects {

  load$ = createEffect(() => this.actions$.pipe(
    ofType(RuleActions.loadRules),
    mergeMap(() => this.rulesService.findAllRule()
      .pipe(
        map(rules => {
          return RuleActions.loadRulesSuccess({ rules });
        }),
        catchError((err) => {
          return of(RuleActions.loadRulesFailure({ error: err }));
        }),
      ))
    )
  );

  constructor(
    private actions$: Actions,
    private rulesService: RuleEngineService,
  ) { }
}
