//angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { Configuration, ConfigurationParameters, HyperiotClientModule } from '@hyperiot/core';
import { CookieService } from 'ngx-cookie-service';

//modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';
import { AuthenticationModule } from './pages/authentication/authentication.module';
import { PasswordResetModule } from './pages/password-reset/password-reset.module';
import { UserActivationModule } from './pages/user-activation/user-activation.module';

//components
import { AppComponent } from './app.component';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    apiKeys: {},
    username: '',
    password: '',
    accessToken: ''
  }
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CustomMaterialModule,
    DashboardModule,
    HytRoutingModule,
    AuthenticationModule,
    PasswordResetModule,
    UserActivationModule,
    HyperiotClientModule.forRoot(apiConfigFactory)
  ],
  providers: [
    CookieService,
    I18n,
    { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        locale = locale || 'en-US';
        return require(`raw-loader!../locale/translations.${locale}.xlf`);
      },
      deps: [LOCALE_ID]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
