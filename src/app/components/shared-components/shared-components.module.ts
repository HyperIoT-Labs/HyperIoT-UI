import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopologyToolbarComponent } from './topology-toolbar/topology-toolbar.component';
import { HyperiotComponentsModule } from '@hyperiot/components';

@NgModule({
  declarations: [
    TopologyToolbarComponent
  ],
  imports: [
    CommonModule,
    HyperiotComponentsModule
  ],
  exports: [
    TopologyToolbarComponent
  ]
})
export class SharedComponentsModule { }
