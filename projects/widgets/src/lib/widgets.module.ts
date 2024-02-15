import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MomentModule } from 'ngx-moment';

import { CommonToolbarComponent } from './widget/common-toolbar/common-toolbar.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { ComponentsModule } from 'components';

import { PlotlyModule } from 'angular-plotly.js';

import { HpacketTableComponent } from './widget/hpacket-table/hpacket-table.component';
import { LoaderComponent } from './widget/loader/loader.component';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from "ng-inline-svg";
import { ToastrModule } from 'ngx-toastr';
import { BaseWidgetTemplateComponent } from './base/base-widget-template/base-widget-template.component';
import { DefaultWidgetComponent } from './default-widget/default-widget.component';
import { AlgorithmTableComponent } from './widget/algorithm-table/algorithm-table.component';
import { BodymapComponent } from "./widget/bodymap/bodymap.component";
import { EcgComponent } from "./widget/ecg/ecg.component";
import { ErrorTableComponent } from './widget/error-table/error-table.component';
import { EventTableComponent } from './widget/event-table/event-table.component';
import { EventsLogComponent } from './widget/events-log/events-log.component';
import { GaugeChartComponent } from './widget/gauge-chart/gauge-chart.component';
import { HistogramChartComponent } from './widget/histogram-chart/histogram-chart.component';
import { LineChartComponent } from './widget/line-chart/line-chart.component';
import { SensorValueComponent } from './widget/sensor-value/sensor-value.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataSimulatorComponent } from './widget/data-simulator/data-simulator.component';
import { DefibrillatorComponent } from './widget/defibrillator/defibrillator.component';
import { MultiStatusWidgetComponent } from './widget/multi-status-widget/multi-status-widget.component';

@NgModule({
  declarations: [
    CommonToolbarComponent,
    LoaderComponent,
    HpacketTableComponent,
    EcgComponent,
    BodymapComponent,
    DefaultWidgetComponent,
    LineChartComponent,
    SensorValueComponent,
    EventsLogComponent,
    ErrorTableComponent,
    EventTableComponent,
    AlgorithmTableComponent,
    GaugeChartComponent,
    HistogramChartComponent,
    BaseWidgetTemplateComponent,
    DataSimulatorComponent,
    DefibrillatorComponent,
    MultiStatusWidgetComponent,
  ],
  imports: [
    MatButtonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    PlotlyModule,
    ComponentsModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        m: 59
      }
    }),
    ToastrModule.forRoot({
      iconClasses: {
        toastEvent: 'toastEvent',
        toastAlarmUp: 'toastAlarmUp',
        toastAlarmDown: 'toastAlarmDown',
      }
    }),
    RouterModule,
    MatProgressBarModule,
    MatIconModule,
    InlineSVGModule.forRoot(),
    MatButtonToggleModule,
    MatProgressSpinnerModule,
  ],
  providers: [
  ],
  exports: [
    CommonToolbarComponent,
    LoaderComponent,
    AlgorithmTableComponent,
    BodymapComponent,
    DataSimulatorComponent,
    DefibrillatorComponent,
    EcgComponent,
    EventsLogComponent,
    EventTableComponent,
    ErrorTableComponent,
    LineChartComponent,
    SensorValueComponent,
    HpacketTableComponent,
    DefaultWidgetComponent,
    GaugeChartComponent,
    HistogramChartComponent,
    MultiStatusWidgetComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WidgetsModule { }
