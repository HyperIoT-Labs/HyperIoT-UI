// angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

// modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';
import { AuthenticationModule } from './pages/authentication/authentication.module';
// toastr module
import { ToastrModule } from 'ngx-toastr';

// components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AccountButtonComponent } from './components/topbar/account-button/account-button.component';

// angular-material
import { MatIconModule } from '@angular/material/icon';

// hyperiot
import { Configuration, ConfigurationParameters, CoreModule, ApiModule, LoggerService, BrandingService, HyperiotStore} from 'core';
import { ComponentsModule } from 'components';
import { AddWidgetDialogComponent, DashboardModule, WidgetSettingsDialogComponent, WidgetsModule } from 'widgets';
import { RouterModule, DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

// local
import { AlgorithmsModule } from './pages/algorithms/algorithms.module';
import { ProjectsModule } from './pages/projects/projects.module';
import { CanDeactivateGuard } from './components/CanDeactivateGuard';
import { SaveChangesDialogComponent } from './components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from './components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { HomeComponent } from './pages/home/home.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NotificationbarComponent } from './components/notificationbar/notificationbar.component';
import { WizardDeactivationModalComponent } from './pages/projects/project-wizard/wizard-deactivation-modal/wizard-deactivation-modal.component';
import { WizardOptionsModalComponent } from './pages/projects/project-wizard/wizard-options-modal/wizard-options-modal.component';
import { WizardReportModalComponent } from './pages/projects/project-wizard/wizard-report-modal/wizard-report-modal.component';
import { AreasViewComponent } from './pages/areas/areas-view/areas-view.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { PromptComponent } from './components/prompt/prompt/prompt.component';
import { PendingChangesDialogComponent } from './components/dialogs/pending-changes-dialog/pending-changes-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { DashComponent } from './pages/dash/dash.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { InfoComponent } from './components/info/info.component';
import { ContainerAreaMapComponent } from './pages/areas/container-area-map/container-area-map.component';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { NotificationButtonComponent } from './components/topbar/notification-button/notification-button.component';
import { NotificationDialogComponent } from './components/dialogs/notification-dialog/notification-dialog.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { GlobalErrorHandlerService } from '../../projects/core/src/lib/hyperiot-service/error-handler/global-error-handler.service';
import {KeyValuePipe} from "@angular/common";

PlotlyModule.plotlyjs = PlotlyJS;

export class MyUrlSerializer extends DefaultUrlSerializer implements UrlSerializer {
  /** Converts a `UrlTree` into a url */
  serialize(tree: UrlTree): string {
    return super.serialize(tree); // .replace(/\(|\)|\w+-\w+:/g, '');
  }
}

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    apiKeys: {},
    username: '',
    password: '',
    accessToken: '',
    basePath: '/hyperiot'
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    SidebarComponent,
    TopbarComponent,
    AccountButtonComponent,
    NotificationButtonComponent,
    ProfileComponent,
    SaveChangesDialogComponent,
    PendingChangesDialogComponent,
    DeleteConfirmDialogComponent,
    NotificationDialogComponent,
    HomeComponent,
    NotificationbarComponent,
    AreasViewComponent,
    PromptComponent,
    DashComponent,
    InfoComponent,
    ContainerAreaMapComponent,
  ],
  // dynamically created components
  entryComponents: [
    SaveChangesDialogComponent,
    PendingChangesDialogComponent,
    DeleteConfirmDialogComponent,
    NotificationDialogComponent,
    WizardDeactivationModalComponent,
    WizardOptionsModalComponent,
    WizardReportModalComponent,
    AddWidgetDialogComponent,
    WidgetSettingsDialogComponent
  ],
  imports: [
    DragDropModule,
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CustomMaterialModule,
    DashboardModule,
    ReactiveFormsModule,
    HytRoutingModule,
    AuthenticationModule,
    ComponentsModule,
    AlgorithmsModule,
    ProjectsModule,
    WidgetsModule,
    ApiModule.forRoot(apiConfigFactory),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    ToastrModule.forRoot(),
    ScrollingModule,
    CoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    StoreModule.forRoot(HyperiotStore.Reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    EffectsModule.forRoot(HyperiotStore.Effects),
  ],
  providers: [
    // ActivatedRouteSnapshot,
    { provide: UrlSerializer, useClass: MyUrlSerializer },
    {
      provide: LoggerService,
      useFactory: () => {
        return new LoggerService(environment.logLevel, environment.logRegistry);
      }
    },
    CanDeactivateGuard,
    CookieService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    BrandingService,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
