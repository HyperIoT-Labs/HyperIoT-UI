//angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

//modules
import { AuthenticationModule } from './pages/authentication/authentication.module';
import { PasswordResetModule } from './pages/password-reset/password-reset.module';
import { UserActivationModule } from './pages/user-activation/user-activation.module';

//configuration modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';



//components
import { AppComponent } from './app.component';


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
    UserActivationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
