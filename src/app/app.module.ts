//angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { Configuration, ConfigurationParameters, HUserClientModule, AuthenticationClientModule } from '@hyperiot/core';
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
    AppComponent
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
    AuthenticationClientModule.forRoot(apiConfigFactory),
    HUserClientModule.forRoot(apiConfigFactory)
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
