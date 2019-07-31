import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
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

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DashboardComponent,
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
    TimeChartSettingsComponent
  ],
  imports: [
    CommonModule,
    GridsterModule,
    WidgetsModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    DashboardConfigService
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
