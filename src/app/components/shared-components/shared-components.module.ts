import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopologyToolbarComponent } from './topology-toolbar/topology-toolbar.component';
import { ComponentsModule } from '@hyperiot/components';

@NgModule({
  declarations: [
    TopologyToolbarComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule
  ],
  exports: [
    TopologyToolbarComponent
  ]
})
export class SharedComponentsModule { }
