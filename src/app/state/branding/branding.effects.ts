import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger, LoggerService, UiBrandingService } from 'core';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';
import { BrandingService } from 'src/app/services/branding/branding.service';
import { BrandingActions, BrandingApiActions } from './branding.actions';
import { BrandingState } from './branding.model';
 
@Injectable()
export class BrandingEffects {

  private logger: Logger;
 
  load$ = createEffect(() => this.actions$.pipe(
    ofType(BrandingActions.load),
    mergeMap(() => this.uiBrandingService.getUIBranding()
      .pipe(
        map(branding => {
          this.logger.debug('laod$ getUIBranding() response', branding);
          const colorSchema = JSON.parse(branding.colorScheme);
          const newBranding: BrandingState = {
            colorSchema,
            logo: {
              standard: this.brandingService.getSanitizedLogo(branding.logoBase64), 
              mobile: this.brandingService.getSanitizedLogo(branding.logoBase64),
            },
            isBrandedTheme: true
          };
          this.logger.debug('laod$ return payload', newBranding);
          return BrandingApiActions.loadSuccess({ payload: newBranding });
        }),
        catchError((err) => {
          this.logger.debug('laod$ getUIBranding() catchError', err);
          return of(BrandingApiActions.loadFailure({ payload: err }));
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
            this.logger.debug('updateAll$ updateBranding() response', res);
            const colorSchema = JSON.parse(res.colorScheme)
            const newBranding: BrandingState = {
              colorSchema,
              logo: {
                standard: res.logoBase64 ? this.brandingService.getSanitizedLogo(res.logoBase64) : action.brandingTheme.fileBase64, 
                mobile: res.logoBase64 ? this.brandingService.getSanitizedLogo(res.logoBase64) : action.brandingTheme.fileBase64,
              },
              isBrandedTheme: true
            };
            this.logger.debug('updateAll$ return payload', newBranding);
            return BrandingApiActions.updateSuccess({ payload: newBranding });
          }),
          catchError(error => {
            this.logger.error('updateAll$ updateBranding() catchError', error);
            return of(BrandingApiActions.updateFailure({ payload: error }));
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
            this.logger.debug('reset$ resetBranding() response', res);
            return BrandingApiActions.resetSuccess({ payload: res });
          }),
          catchError(error => {
            this.logger.error('reset$ resetBranding() catchError', error);
            return of(BrandingApiActions.resetFailure({ payload: error }));
          })
        )
      )
    )
  );
 
  constructor(
    private actions$: Actions,
    private brandingService: BrandingService,
    private uiBrandingService: UiBrandingService,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("BrandingEffects");
  }
}