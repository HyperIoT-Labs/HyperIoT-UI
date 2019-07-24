//angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { Configuration, ConfigurationParameters, HUserClientModule, AuthenticationClientModule, DataStreamService, HyperiotClientModule } from '@hyperiot/core';
import { CookieService } from 'ngx-cookie-service';

//modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';
import { AuthenticationModule } from './pages/authentication/authentication.module';
import { PasswordResetModule } from './pages/password-reset/password-reset.module';
import { UserActivationModule } from './pages/user-activation/user-activation.module';

//components
import { AppComponent } from './app.component';
import { TestModule } from './pages/test/test.module';
import { I18n } from '@ngx-translate/i18n-polyfill';

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
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CustomMaterialModule,
    HytRoutingModule,
    AuthenticationModule,
    PasswordResetModule,
    UserActivationModule,
    TestModule,

    HyperiotClientModule.forRoot(apiConfigFactory)
  ],
  providers: [
    CookieService,

    I18n,
    { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        locale = locale || 'en-US'; // default to english if no locale provided
        return require(`raw-loader!../locale/translations.${locale}.xlf`);
      },
      deps: [LOCALE_ID]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
