import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material';

import { RatingModule } from 'ng-starrating';

import { HyperiotComponentsModule } from '@hyperiot/components';

import { WidgetsLayoutComponent } from './widgets-layout/widgets-layout.component';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component';
import { GridsterModule } from 'angular-gridster2';
import { WidgetsModule } from '@hyperiot/widgets';
import { DashboardConfigService } from './dashboard-config.service';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { WidgetSettingsDialogComponent } from './widget-settings-dialog/widget-settings-dialog.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { DashboardsListComponent } from './dashboards-list/dashboards-list.component';
import { EventsLogSettingsComponent } from './widget-settings-dialog/events-log-settings/events-log-settings.component';
import { PacketSelectComponent } from './widget-settings-dialog/packet-select/packet-select.component';
import { SensorValueSettingsComponent } from './widget-settings-dialog/sensor-value-settings/sensor-value-settings.component';
import { StatsChartSettingsComponent } from './widget-settings-dialog/stats-chart-settings/stats-chart-settings.component';
import { TextLabelSettingsComponent } from './widget-settings-dialog/text-label-settings/text-label-settings.component';
import { TimeChartSettingsComponent } from './widget-settings-dialog/time-chart-settings/time-chart-settings.component';

import { MyTelInputComponent } from '../../test/my-tel-input/my-tel-input.component';
import { DashboardComponent } from './dashboard.component';
import { SharedComponentsModule } from 'src/app/components/shared-components/shared-components.module';

@NgModule({
  declarations: [
    WidgetsLayoutComponent,
    DynamicWidgetComponent,
    AddWidgetDialogComponent,
    WidgetSettingsDialogComponent,
    DashboardViewComponent,
    DashboardsListComponent,
    EventsLogSettingsComponent,
    PacketSelectComponent,
    SensorValueSettingsComponent,
    StatsChartSettingsComponent,
    TextLabelSettingsComponent,
    TimeChartSettingsComponent,
    MyTelInputComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RatingModule,
    MatIconModule,
    HyperiotComponentsModule,
    GridsterModule,
    WidgetsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    SharedComponentsModule
  ],
  providers: [
    DashboardConfigService
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
