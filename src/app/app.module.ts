// angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

// modules
import { HytRoutingModule } from './configuration-modules/hyt-routing.module';
import { CustomMaterialModule } from './configuration-modules/custom-material.module';
import { AuthenticationModule } from './pages/authentication/authentication.module';
// toastr module
import { ToastrModule } from 'ngx-toastr';

// components
import { AppComponent } from './app.component';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AccountButtonComponent } from './components/topbar/account-button/account-button.component';

// angular-material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MatTabsModule, MatCardModule } from '@angular/material';

// hyperiot
import { Configuration, ConfigurationParameters, HyperiotClientModule } from '@hyperiot/core';
import { ComponentsModule } from '@hyperiot/components';
import { WidgetsModule } from '@hyperiot/widgets';
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
import { ConfirmRecordingActionComponent } from './components/modals/confirm-recording-action/confirm-recording-action.component';
import { InfoRecordingActionComponent } from './components/modals/info-recording-action/info-recording-action.component';
import { WizardDeactivationModalComponent } from './pages/projects/project-wizard/wizard-deactivation-modal/wizard-deactivation-modal.component';
import { WizardOptionsModalComponent } from './pages/projects/project-wizard/wizard-options-modal/wizard-options-modal.component';
import { WizardReportModalComponent } from './pages/projects/project-wizard/wizard-report-modal/wizard-report-modal.component';
import { RuleErrorModalComponent } from './pages/projects/project-forms/rule-definition/rule-error/rule-error-modal.component';
import { AddWidgetDialogComponent } from './pages/dashboard/add-widget-dialog/add-widget-dialog.component';
import { WidgetSettingsDialogComponent } from './pages/dashboard/widget-settings-dialog/widget-settings-dialog.component';
import { AreasViewComponent } from './pages/areas/areas-view/areas-view.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { PromptComponent } from './components/prompt/prompt/prompt.component';
import { PendingChangesDialogComponent } from './components/dialogs/pending-changes-dialog/pending-changes-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
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
    accessToken: ''
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
    ProfileComponent,
    SaveChangesDialogComponent,
    PendingChangesDialogComponent,
    DeleteConfirmDialogComponent,
    HomeComponent,
    NotificationbarComponent,
    ConfirmRecordingActionComponent,
    InfoRecordingActionComponent,
    AreasViewComponent,
    PromptComponent
  ],
  // dynamically created components
  entryComponents: [
    SaveChangesDialogComponent,
    PendingChangesDialogComponent,
    DeleteConfirmDialogComponent,
    ConfirmRecordingActionComponent,
    InfoRecordingActionComponent,
    WizardDeactivationModalComponent,
    WizardOptionsModalComponent,
    WizardReportModalComponent,
    RuleErrorModalComponent,
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
        CustomMaterialModule,
        DashboardModule,
        ReactiveFormsModule,
        HytRoutingModule,
        AuthenticationModule,
        ComponentsModule,
        AlgorithmsModule,
        ProjectsModule,
        WidgetsModule,
        HyperiotClientModule.forRoot(apiConfigFactory),
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production, registrationStrategy: 'registerImmediately'}),
        ToastrModule.forRoot(),
        ScrollingModule
    ],
  providers: [
    // ActivatedRouteSnapshot,
    { provide: UrlSerializer, useClass: MyUrlSerializer },
    CanDeactivateGuard,
    CookieService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
