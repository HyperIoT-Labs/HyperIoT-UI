/*
 * Public API Surface of widgets
 */

export * from './lib/widgets.module';

export { CommonToolbarComponent } from './lib/widget/common-toolbar/common-toolbar.component';
export { LoaderComponent } from './lib/widget/loader/loader.component';

export { HpacketTableComponent } from './lib/widget/hpacket-table/hpacket-table.component';
export { LineChartComponent } from './lib/widget/line-chart/line-chart.component';
export { SensorValueComponent } from './lib/widget/sensor-value/sensor-value.component';
export { AlgorithmTableComponent } from './lib/widget/algorithm-table/algorithm-table.component';
export { BodymapComponent } from './lib/widget/bodymap/bodymap.component';
export { EventsLogComponent } from './lib/widget/events-log/events-log.component';
export { ErrorTableComponent } from './lib/widget/error-table/error-table.component';
export { EventTableComponent } from './lib/widget/event-table/event-table.component';
export { DefaultWidgetComponent } from './lib/default-widget/default-widget.component';
export { GaugeChartComponent } from './lib/widget/gauge-chart/gauge-chart.component';
export { TrendGaugeChartComponent } from './lib/widget/trend-gauge-chart/trend-gauge-chart.component';
export { HistogramChartComponent } from './lib/widget/histogram-chart/histogram-chart.component';
export { EcgComponent } from './lib/widget/ecg/ecg.component';
export { DataSimulatorComponent } from './lib/widget/data-simulator/data-simulator.component';
export { DefibrillatorComponent } from './lib/widget/defibrillator/defibrillator.component';
export { MultiStatusWidgetComponent } from './lib/widget/multi-status-widget/multi-status-widget.component';
export { DynamicLabelValueWidgetComponent } from './lib/widget/dynamic-label-value-widget/dynamic-label-value-widget.component';
export { ProductionTargetComponent } from './lib/widget/production-target/production-target.component';
export { AlarmsWidgetComponent } from './lib/widget/alarms-widget/alarms-widget.component';

export { ServiceType } from './lib/service/model/service-type';
export * from './lib/dashboard/dashboard.module'
export * from './lib/dashboard/dashboard.component'
export * from './lib/dashboard/dashboard-config.service'
export * from './lib/dashboard/dashboard-config.service'
export * from './lib/dashboard/add-widget-dialog/add-widget-dialog.component'

export * from './lib/dashboard/widgets-layout/widgets-layout.component'
export * from './lib/dashboard/dashboard-view/dashboard-view.component'
export * from './lib/dashboard/timeline/timeline.component'
export * from './lib/dashboard/timeline/time-axis/time-axis.component'

export * from './lib/dashboard/widget-settings-dialog/widget-settings-dialog.component'
export * from './lib/dashboard/dynamic-widget/dynamic-widget.component'
export * from './lib/dashboard/dashboard-debug/dashboard-debug.component'
