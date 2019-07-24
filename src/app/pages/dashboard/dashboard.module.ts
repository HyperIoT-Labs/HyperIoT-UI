import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { WidgetsLayoutComponent } from './widgets-layout/widgets-layout.component';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component';
import { GridsterModule } from 'angular-gridster2';
import { WidgetsModule } from '@hyperiot/widgets';
import { DashboardConfigService } from './dashboard-config.service';



@NgModule({
  declarations: [DashboardComponent, WidgetsLayoutComponent, DynamicWidgetComponent],
  imports: [
    CommonModule,
    GridsterModule,
    WidgetsModule
  ],
  providers: [
    DashboardConfigService
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
