import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule, HytRadioButtonComponent} from 'components';
import { GridsterModule } from 'angular-gridster2';
import { AddWidgetDialogComponent } from './add-widget-dialog/add-widget-dialog.component';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardsListComponent } from './dashboards-list/dashboards-list.component';
import { TimeAxisComponent } from './timeline/time-axis/time-axis.component';
import { EventsLogSettingsComponent } from './widget-settings-dialog/events-log-settings/events-log-settings.component';
import { PacketSelectComponent } from './widget-settings-dialog/packet-select/packet-select.component';
import { SensorValueSettingsComponent } from './widget-settings-dialog/sensor-value-settings/sensor-value-settings.component';
import { TimeChartSettingsComponent } from './widget-settings-dialog/time-chart-settings/time-chart-settings.component';
import { WidgetSettingsDialogComponent } from './widget-settings-dialog/widget-settings-dialog.component';
import { AlgorithmSelectComponent } from './widget-settings-dialog/algorithm-settings/algorithm-select/algorithm-select.component';
import { AlgorithmSettingsComponent } from './widget-settings-dialog/algorithm-settings/algorithm-settings.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSliderModule } from "@angular/material/slider";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { DashboardDebugComponent } from './dashboard-debug/dashboard-debug.component';
import { BodymapSettingsComponent } from "./widget-settings-dialog/bodymap-settings/bodymap-settings.component";
import { EcgSettingsComponent } from "./widget-settings-dialog/ecg-settings/ecg-settings.component";
import { WidgetFullscreenDialogComponent } from './widget-fullscreen-dialog/widget-fullscreen-dialog.component';
import { DashboardComponent } from './dashboard.component';
import { TimelineComponent } from './timeline/timeline.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component'
import { WidgetsDashboardLayoutComponent } from './widgets-layout/widgets-layout.component';
import { WidgetsModule } from '../widgets.module';
import { BodyMapAssociationComponent } from './widget-settings-dialog/bodymap-settings/body-map-association/body-map-association.component';
import { PacketsSelectComponent } from './widget-settings-dialog/bodymap-settings/packets-select/packets-select.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DefibrillatorSettingsComponent } from './widget-settings-dialog/defibrillator-settings/defibrillator-settings.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PacketFieldsSelectComponent } from './widget-settings-dialog/packet-fields-select/packet-fields-select.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { DataSimulatorSettingsComponent } from './widget-settings-dialog/data-simulator-settings/data-simulator-settings.component';
import { FieldValueGeneratorSettingsComponent } from './widget-settings-dialog/data-simulator-settings/field-value-generator-settings/field-value-generator-settings.component';
import { MatButtonModule } from '@angular/material/button';
import { ProductionTargetSettingsComponent } from './widget-settings-dialog/production-target-settings/production-target-settings.component';
import { WidgetValueMappingComponent } from './widget-settings-dialog/packet-select/widget-value-mapping/widget-value-mapping.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    DashboardComponent,
    TimelineComponent,
    AddWidgetDialogComponent,
    WidgetSettingsDialogComponent,
    DashboardsListComponent,
    EventsLogSettingsComponent,
    PacketSelectComponent,
    SensorValueSettingsComponent,
    TimeChartSettingsComponent,
    TimeAxisComponent,
    AlgorithmSelectComponent,
    AlgorithmSettingsComponent,
    DashboardDebugComponent,
    BodymapSettingsComponent,
    EcgSettingsComponent,
    WidgetFullscreenDialogComponent,
    DashboardViewComponent,
    DynamicWidgetComponent,
    WidgetsDashboardLayoutComponent,
    BodyMapAssociationComponent,
    PacketsSelectComponent,
    DefibrillatorSettingsComponent,
    PacketFieldsSelectComponent,
    DataSimulatorSettingsComponent,
    FieldValueGeneratorSettingsComponent,
    ProductionTargetSettingsComponent,
    WidgetValueMappingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ComponentsModule,
    GridsterModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatIconModule,
    MatTabsModule,
    WidgetsModule,
    MatCheckboxModule,
    ColorPickerModule
  ],
  providers: [
    DashboardConfigService,
  ],
  exports: [
    DashboardComponent,
    DashboardDebugComponent,
    DashboardViewComponent,
    DynamicWidgetComponent,
    WidgetsDashboardLayoutComponent,
    HytRadioButtonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
