import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { WidgetsModule } from '@hyperiot/widgets';
import { GridsterModule } from 'angular-gridster2';
import { RatingModule } from 'ng-starrating';
import { MyTelInputComponent } from '../../test/my-tel-input/my-tel-input.component';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardsListComponent } from './dashboards-list/dashboards-list.component';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component';
import { TimelineComponent } from './timeline/timeline.component';
import { EventsLogSettingsComponent } from './widget-settings-dialog/events-log-settings/events-log-settings.component';
import { PacketSelectComponent } from './widget-settings-dialog/packet-select/packet-select.component';
import { SensorValueSettingsComponent } from './widget-settings-dialog/sensor-value-settings/sensor-value-settings.component';
import { StatsChartSettingsComponent } from './widget-settings-dialog/stats-chart-settings/stats-chart-settings.component';
import { TextLabelSettingsComponent } from './widget-settings-dialog/text-label-settings/text-label-settings.component';
import { TimeChartSettingsComponent } from './widget-settings-dialog/time-chart-settings/time-chart-settings.component';
import { WidgetSettingsDialogComponent } from './widget-settings-dialog/widget-settings-dialog.component';
import { WidgetsLayoutComponent } from './widgets-layout/widgets-layout.component';
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
    DashboardComponent,
    TimelineComponent
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
    MatButtonToggleModule,
    SharedComponentsModule
  ],
  providers: [
    DashboardConfigService
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
