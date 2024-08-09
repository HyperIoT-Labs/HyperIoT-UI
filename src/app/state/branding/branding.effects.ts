import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UiBrandingService } from 'core';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { BrandingService } from 'src/app/services/branding/branding.service';
import { BrandingActions, BrandingApiActions } from './branding.actions';
 
@Injectable()
export class BrandingEffects {
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(BrandingActions.load),
    mergeMap(() => this.uiBrandingService.getUIBranding()
      .pipe(
        map(branding => BrandingApiActions.loadSuccess({ payload: branding })),
        catchError(() => EMPTY)
      ))
    ) 
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BrandingActions.update),
      exhaustMap(action =>
        this.brandingService.updateBranding(action.brandingTheme).pipe(
          map(res => BrandingApiActions.updateSuccess({ payload: res })),
          catchError(error => of(BrandingApiActions.updateFailure({ payload: error })))
        )
      )
    )
  );
 
  constructor(
    private actions$: Actions,
    private brandingService: BrandingService,
    private uiBrandingService: UiBrandingService
  ) {}
}