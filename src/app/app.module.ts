//angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { CookieService } from 'ngx-cookie-service';

//modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';
import { AuthenticationModule } from './pages/authentication/authentication.module';

//components
import { AppComponent } from './app.component';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AccountButtonComponent } from './components/topbar/account-button/account-button.component';

// angular-material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';

// hyperiot
import { Configuration, ConfigurationParameters, HyperiotClientModule } from '@hyperiot/core';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule } from '@angular/router';

// local
import { ProjectsModule } from './pages/projects/projects.module';
import { CanDeactivateGuard } from './components/CanDeactivateGuard';
import { SaveChangesDialogComponent } from './components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from './components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

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
    NotFoundComponent,
    SidebarComponent,
    TopbarComponent,
    AccountButtonComponent,
    ProfileComponent,
    SaveChangesDialogComponent,
    DeleteConfirmDialogComponent
  ],
  // dynamically created components
  entryComponents: [
    SaveChangesDialogComponent,
    DeleteConfirmDialogComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    CustomMaterialModule,
    DashboardModule,
    ReactiveFormsModule,
    HytRoutingModule,
    AuthenticationModule,
    HyperiotComponentsModule,
    ProjectsModule,
    HyperiotClientModule.forRoot(apiConfigFactory)
  ],
  providers: [
    // ActivatedRouteSnapshot,
    CanDeactivateGuard,
    CookieService,
    I18n,
    { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        locale = locale || 'en-US';
        return require(`raw-loader!../locale/translations.${locale}.xlf`);
      },
      deps: [LOCALE_ID]
    },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
