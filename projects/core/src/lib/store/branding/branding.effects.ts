import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UiBrandingService } from '../../hyperiot-client/uibranding-client/api-module';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { BrandingStore } from './branding.reducer';
import { BrandingActions } from './branding.actions';
import { BrandingService } from '../../services/branding/branding.service';
 
@Injectable()
export class BrandingEffects {
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(BrandingActions.load),
    mergeMap(() => this.uiBrandingService.getUIBranding()
      .pipe(
        map(branding => {
          const colorSchema = JSON.parse(branding.colorScheme);
          const newBranding: BrandingStore.State = {
            colorSchema,
            logo: {
              standard: this.brandingService.getSanitizedLogo(branding.logoBase64), 
              mobile: this.brandingService.getSanitizedLogo(branding.logoBase64),
            },
            isBrandedTheme: true
          };
          return BrandingActions.loadSuccess({ payload: newBranding });
        }),
        catchError((err) => {
          return of(BrandingActions.loadFailure({ payload: err }));
        })
      ))
    ) 
  );

  updateAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BrandingActions.updateAll),
      exhaustMap(action =>
        this.brandingService.updateBranding(action.brandingTheme).pipe(
          map(res => {
            const colorSchema = JSON.parse(res.colorScheme)
            const newBranding: BrandingStore.State = {
              colorSchema,
              logo: {
                standard: res.logoBase64 ? this.brandingService.getSanitizedLogo(res.logoBase64) : action.brandingTheme.fileBase64, 
                mobile: res.logoBase64 ? this.brandingService.getSanitizedLogo(res.logoBase64) : action.brandingTheme.fileBase64,
              },
              isBrandedTheme: true
            };
            return BrandingActions.updateSuccess({ payload: newBranding });
          }),
          catchError(error => {
            return of(BrandingActions.updateFailure({ payload: error }));
          })
        )
      )
    )
  );

  reset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BrandingActions.reset),
      exhaustMap(action =>
        this.brandingService.resetBranding().pipe(
          map(res => {
            return BrandingActions.resetSuccess({ payload: res });
          }),
          catchError(error => {
            return of(BrandingActions.resetFailure({ payload: error }));
          })
        )
      )
    )
  );
 
  constructor(
    private actions$: Actions,
    private brandingService: BrandingService,
    private uiBrandingService: UiBrandingService
  ) { }
}